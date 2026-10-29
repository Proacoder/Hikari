import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MUMBAI_WARDS_GEOJSON, getWardHeatmapStyle } from '../../utils/mumbaiWardsGeo';
import { classNames } from '../../utils/formatters';

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Custom SVG marker generator based on severity
const createMarkerIcon = (severity, _category) => {
  let color = '#16a34a'; // Low (< 40)
  if (severity >= 80) color = '#dc2626'; // Critical
  else if (severity >= 60) color = '#ea580c'; // High
  else if (severity >= 40) color = '#d97706'; // Medium

  const isCritical = severity >= 80;
  const isHigh = severity >= 60;

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${isCritical ? `
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: ${color}; opacity: 0.45; animation: radarSweep 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; inset: -4px; border-radius: 50%; border: 1.5px solid ${color}; opacity: 0.6; animation: radarSweep 1.8s cubic-bezier(0, 0, 0.2, 1) 0.6s infinite;"></div>
      ` : isHigh ? `
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      ` : `
        <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background-color: ${color}; opacity: 0.2; animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      `}
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 800; font-family: monospace;">
        ${severity}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Draggable pin icon for location picker
const createPickerIcon = () => {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #ea580c; border: 3px solid #ffffff; box-shadow: 0 6px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #ea580c; margin-top: -2px;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'picker-leaflet-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
};

export const LeafletMap = ({
  center = [19.0760, 72.8777], // Mumbai default
  zoom = 12,
  complaints = [],
  pickerMode = false,
  selectedPosition = null,
  onPositionChange = null,
  height = '500px',
  className = '',
  onComplaintClick = null,
  _showWardCircles = false
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const [mapViewMode, setMapViewMode] = useState('pins'); // 'pins' | 'wards'
  const centerLat = center?.[0];
  const centerLng = center?.[1];

  const onPositionChangeRef = useRef(onPositionChange);
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  const onComplaintClickRef = useRef(onComplaintClick);
  useEffect(() => {
    onComplaintClickRef.current = onComplaintClick;
  }, [onComplaintClick]);

  // Intercept Leaflet popup navigation links for client-side routing
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handlePopupClick = (e) => {
      const link = e.target.closest('.leaflet-popup-nav-link');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const cid = link.getAttribute('data-complaint-id');
        if (cid) {
          navigate(`/app/complaint/${decodeURIComponent(cid)}`);
        }
      }
    };

    container.addEventListener('click', handlePopupClick);
    return () => {
      container.removeEventListener('click', handlePopupClick);
    };
  }, [navigate]);

  const initialCenterRef = useRef(center);

  // Initialize Map once
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    if (mapInstanceRef.current) return;

    const c = initialCenterRef.current;
    const initialCenter = (c && c[0] != null && c[1] != null && !isNaN(c[0]))
      ? [Number(c[0]), Number(c[1])]
      : [19.0760, 72.8777];

    const map = L.map(container, {
      center: initialCenter,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Kaiser AI',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle map clicks in picker mode
    const handleMapClick = (e) => {
      if (!pickerMode) return;
      const { lat, lng } = e.latlng;
      const roundedLat = parseFloat(lat.toFixed(6));
      const roundedLng = parseFloat(lng.toFixed(6));

      if (!pickerMarkerRef.current) {
        const marker = L.marker([roundedLat, roundedLng], {
          icon: createPickerIcon(),
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(map);

        marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          const dLat = parseFloat(position.lat.toFixed(6));
          const dLng = parseFloat(position.lng.toFixed(6));
          onPositionChangeRef.current?.({ lat: dLat, lng: dLng });
        });

        pickerMarkerRef.current = marker;
      } else {
        pickerMarkerRef.current.setLatLng([roundedLat, roundedLng]);
        if (!map.hasLayer(pickerMarkerRef.current)) {
          pickerMarkerRef.current.addTo(map);
        }
      }

      onPositionChangeRef.current?.({ lat: roundedLat, lng: roundedLng });
    };

    map.on('click', handleMapClick);

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
        pickerMarkerRef.current = null;
      }
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        markersLayerRef.current = null;
      }
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
        geoJsonLayerRef.current = null;
      }
      map.off('click', handleMapClick);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pickerMode, zoom]);

  // Handle container resize
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [height]);

  // Update Center if changed externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || centerLat == null || centerLng == null) return;
    const targetLat = Number(centerLat);
    const targetLng = Number(centerLng);
    if (isNaN(targetLat) || isNaN(targetLng)) return;

    const currentCenter = map.getCenter();
    if (Math.abs(currentCenter.lat - targetLat) > 0.0001 || Math.abs(currentCenter.lng - targetLng) > 0.0001) {
      map.setView([targetLat, targetLng], zoom || map.getZoom());
    }
  }, [centerLat, centerLng, zoom]);

  // Update Markers or Ward Polygons based on mapViewMode
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clean existing layers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (pickerMode) return;

    // 1. Pins View Mode
    if (mapViewMode === 'pins' && complaints.length > 0) {
      complaints.forEach((c) => {
        if (!c.latitude || !c.longitude) return;

        const markerIcon = createMarkerIcon(c.severity, c.category);
        const marker = L.marker([c.latitude, c.longitude], { icon: markerIcon });

        const categoryEsc = escapeHtml(c.category);
        const statusEsc = escapeHtml(c.status);
        const titleEsc = escapeHtml(c.title);
        const wardEsc = escapeHtml(c.ward);
        const severityEsc = escapeHtml(c.severity);
        const upvoteEsc = escapeHtml(c.upvoteCount || 0);
        const idEsc = encodeURIComponent(String(c.id));

        const popupContent = `
          <div style="padding: 12px; font-family: Inter, sans-serif; max-width: 250px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #16a34a; letter-spacing: 0.5px;">${categoryEsc}</span>
              <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background-color: #f1f5f9; color: #475569;">${statusEsc}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">${titleEsc}</h4>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              <span>Ward: <strong>${wardEsc}</strong></span> · <span>Severity: <strong>${severityEsc}/100</strong></span>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: #64748b;">👍 ${upvoteEsc} Upvotes</span>
              <a href="/app/complaint/${idEsc}" data-complaint-id="${idEsc}" class="leaflet-popup-nav-link" style="font-size: 11px; color: #16a34a; font-weight: 600; text-decoration: none; cursor: pointer;">View Details →</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280, className: 'kaiser-map-popup' });

        if (onComplaintClickRef.current) {
          marker.on('click', () => onComplaintClickRef.current(c));
        }

        markersLayerRef.current.addLayer(marker);
      });
    }

    // 2. Ward Choropleth Heatmap Mode
    if (mapViewMode === 'wards') {
      const geoLayer = L.geoJSON(MUMBAI_WARDS_GEOJSON, {
        style: (feature) => {
          const wardId = feature.properties.id;
          const matchingComplaints = complaints.filter(
            (c) => Number(c.ward) === Number(wardId) || String(c.ward).toLowerCase().includes(feature.properties.code.toLowerCase())
          );
          return getWardHeatmapStyle(matchingComplaints.length);
        },
        onEachFeature: (feature, layer) => {
          const wardId = feature.properties.id;
          const matchingComplaints = complaints.filter(
            (c) => Number(c.ward) === Number(wardId) || String(c.ward).toLowerCase().includes(feature.properties.code.toLowerCase())
          );
          const count = matchingComplaints.length;
          const critical = matchingComplaints.filter((c) => (c.severity || 0) >= 80).length;

          const tooltipHtml = `
            <div style="font-family: Inter, sans-serif; font-size: 12px; line-height: 1.4;">
              <strong style="color: #0f172a; font-size: 13px;">${feature.properties.code}</strong> - ${feature.properties.name}<br/>
              <span style="color: #64748b; font-size: 10px;">${feature.properties.zone}</span>
              <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;"/>
              <span>Active Issues: <strong>${count}</strong></span> · <span style="color: #dc2626;">Critical: <strong>${critical}</strong></span><br/>
              <span style="color: #0284c7; font-size: 10px;">Asst. Comm: ${feature.properties.ac}</span>
            </div>
          `;
          layer.bindTooltip(tooltipHtml, { sticky: true, className: 'ward-choropleth-tooltip' });

          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({ weight: 3, fillOpacity: 0.5, color: '#0f172a' });
            },
            mouseout: (e) => {
              geoLayer.resetStyle(e.target);
            }
          });
        }
      }).addTo(mapInstanceRef.current);

      geoJsonLayerRef.current = geoLayer;
    }
  }, [complaints, pickerMode, mapViewMode]);

  // Update Picker Marker
  const posLat = selectedPosition?.lat;
  const posLng = selectedPosition?.lng;
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickerMode) return;

    if (posLat != null && posLng != null) {
      const lat = Number(posLat);
      const lng = Number(posLng);
      if (isNaN(lat) || isNaN(lng)) return;

      if (!pickerMarkerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: createPickerIcon(),
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(map);

        marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          const dLat = parseFloat(position.lat.toFixed(6));
          const dLng = parseFloat(position.lng.toFixed(6));
          onPositionChangeRef.current?.({ lat: dLat, lng: dLng });
        });

        pickerMarkerRef.current = marker;
      } else {
        pickerMarkerRef.current.setLatLng([lat, lng]);
        if (!map.hasLayer(pickerMarkerRef.current)) {
          pickerMarkerRef.current.addTo(map);
        }
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickerMode, posLat, posLng]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-soft-sm border border-neutral-200 z-10 ${className}`}>
      {/* Floating Layer Mode Switcher */}
      {!pickerMode && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-soft-md border border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMapViewMode('pins')}
            className={classNames(
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
              mapViewMode === 'pins'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            )}
          >
            📍 Issue Pins
          </button>
          <button
            type="button"
            onClick={() => setMapViewMode('wards')}
            className={classNames(
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
              mapViewMode === 'wards'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            )}
          >
            🗺️ Ward Heatmap
          </button>
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{ height: height || '400px', width: '100%' }}
      />
    </div>
  );
};
