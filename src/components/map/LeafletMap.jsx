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

// Vibrant Red Pin icon for location picker
const createPickerIcon = () => {
  const html = `
    <div style="position: relative; width: 38px; height: 50px; display: flex; flex-direction: column; align-items: center; cursor: grab; user-select: none;">
      <!-- Pulsing ground ripple at the pin tip -->
      <div style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 22px; height: 8px; border-radius: 50%; background: rgba(220, 38, 38, 0.25); border: 1.5px solid rgba(220, 38, 38, 0.7); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      
      <!-- Vivid Red Teardrop Map Pin -->
      <svg width="38" height="50" viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
        <path d="M19 2 C9.61 2 2 9.61 2 19 C2 30.5 17.2 46.5 18.25 47.6 C18.65 48.05 19.35 48.05 19.75 47.6 C20.8 46.5 36 30.5 36 19 C36 9.61 28.39 2 19 2 Z" 
              fill="url(#redPinGrad)" 
              stroke="#ffffff" 
              stroke-width="2.5" />
        <circle cx="19" cy="19" r="7.5" fill="#ffffff" />
        <circle cx="19" cy="19" r="3.8" fill="#dc2626" />
        <defs>
          <linearGradient id="redPinGrad" x1="19" y1="2" x2="19" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="65%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#991b1b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'picker-leaflet-red-marker',
    iconSize: [38, 50],
    iconAnchor: [19, 48],
    popupAnchor: [0, -48]
  });
};

const getPickerPopupContent = (lat, lng) => `
  <div style="font-family: Inter, -apple-system, sans-serif; padding: 6px 10px; min-width: 175px;">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 5px;">
      <span style="display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">
        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 6px #ef4444;"></span>
        Pinned Location
      </span>
      <span style="font-size: 9px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 1px 6px; border-radius: 9999px;">Live</span>
    </div>
    <div style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; font-weight: 700; color: #0f172a; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 8px; margin-bottom: 4px; text-align: center;">
      ${Number(lat).toFixed(6)}° N, ${Number(lng).toFixed(6)}° E
    </div>
    <div style="font-size: 10px; color: #64748b; text-align: center;">
      Click anywhere to move pin
    </div>
  </div>
`;

const getInspectPopupContent = (lat, lng) => `
  <div style="font-family: Inter, -apple-system, sans-serif; padding: 6px 10px; min-width: 190px;">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 5px;">
      <span style="display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">
        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 6px #ef4444;"></span>
        Location Coordinates
      </span>
      <span style="font-size: 9px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 9999px;">GPS Pin</span>
    </div>
    <div style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; font-weight: 700; color: #0f172a; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 8px; margin-bottom: 6px; text-align: center;">
      ${Number(lat).toFixed(6)}° N, ${Number(lng).toFixed(6)}° E
    </div>
    <a href="/app/report?lat=${Number(lat).toFixed(6)}&lng=${Number(lng).toFixed(6)}" class="leaflet-popup-nav-link" style="display: block; text-align: center; font-size: 11px; font-weight: 700; color: #ffffff; background: #dc2626; padding: 5px 10px; border-radius: 8px; text-decoration: none; cursor: pointer;">
      Report Issue Here →
    </a>
  </div>
`;

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
  const clickInspectMarkerRef = useRef(null);
  const [mapViewMode, setMapViewMode] = useState('pins'); // 'pins' | 'wards'
  const centerLat = center?.[0];
  const centerLng = center?.[1];

  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;
  const pickerModeRef = useRef(pickerMode);
  pickerModeRef.current = pickerMode;

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

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = [centerLat || 19.0760, centerLng || 72.8777];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom || 12,
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

      // Handle map clicks in picker mode without tearing down the map
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (pickerModeRef.current) {
          if (pickerMarkerRef.current && map.hasLayer(pickerMarkerRef.current)) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
            pickerMarkerRef.current.setPopupContent(getPickerPopupContent(lat, lng));
            pickerMarkerRef.current.openPopup();
          }
          if (onPositionChangeRef.current) {
            onPositionChangeRef.current({ lat, lng });
          }
        } else {
          // On non-picker general map, click anywhere to see coordinates and report option
          if (clickInspectMarkerRef.current && map.hasLayer(clickInspectMarkerRef.current)) {
            clickInspectMarkerRef.current.setLatLng([lat, lng]);
            clickInspectMarkerRef.current.setPopupContent(getInspectPopupContent(lat, lng));
            clickInspectMarkerRef.current.openPopup();
          } else {
            const inspMarker = L.marker([lat, lng], {
              icon: createPickerIcon(),
              zIndexOffset: 1500,
            }).addTo(map);
            inspMarker.bindPopup(getInspectPopupContent(lat, lng), {
              offset: [0, -48],
              className: 'kaiser-picker-popup',
            }).openPopup();
            clickInspectMarkerRef.current = inspMarker;
          }
        }
      });
    }

    return () => {
      if (clickInspectMarkerRef.current) {
        try { clickInspectMarkerRef.current.remove(); } catch (e) {}
        clickInspectMarkerRef.current = null;
      }
      if (pickerMarkerRef.current) {
        try { pickerMarkerRef.current.remove(); } catch (e) {}
        pickerMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size on height or mode changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [height, pickerMode]);

  // Update Center if changed noticeably
  useEffect(() => {
    if (mapInstanceRef.current && centerLat != null && centerLng != null) {
      const current = mapInstanceRef.current.getCenter();
      if (Math.abs(current.lat - centerLat) > 0.0001 || Math.abs(current.lng - centerLng) > 0.0001) {
        mapInstanceRef.current.setView([centerLat, centerLng], zoom || mapInstanceRef.current.getZoom(), {
          animate: true,
        });
      }
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

        if (onComplaintClick) {
          marker.on('click', () => onComplaintClick(c));
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
  }, [complaints, pickerMode, mapViewMode, onComplaintClick]);

  // Update Picker Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (pickerMode && selectedPosition && selectedPosition.lat != null && selectedPosition.lng != null) {
      const lat = selectedPosition.lat;
      const lng = selectedPosition.lng;

      // If marker doesn't exist or is not attached to this map, create and add it
      if (!pickerMarkerRef.current || !mapInstanceRef.current.hasLayer(pickerMarkerRef.current)) {
        if (pickerMarkerRef.current) {
          try { pickerMarkerRef.current.remove(); } catch (e) {}
        }

        const marker = L.marker([lat, lng], {
          icon: createPickerIcon(),
          draggable: true,
          zIndexOffset: 2000,
          title: 'Selected Location (Drag or click anywhere on map to move pin)',
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(getPickerPopupContent(lat, lng), {
          offset: [0, -48],
          className: 'kaiser-picker-popup',
          closeButton: false,
          autoClose: false,
          closeOnClick: false,
        });

        // Always keep coordinates popup open
        marker.openPopup();

        marker.on('drag', (event) => {
          const pos = event.target.getLatLng();
          marker.setPopupContent(getPickerPopupContent(pos.lat, pos.lng));
        });

        marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          marker.setPopupContent(getPickerPopupContent(position.lat, position.lng));
          marker.openPopup();
          if (onPositionChangeRef.current) {
            onPositionChangeRef.current({ lat: position.lat, lng: position.lng });
          }
        });

        pickerMarkerRef.current = marker;
      } else {
        pickerMarkerRef.current.setLatLng([lat, lng]);
        pickerMarkerRef.current.setPopupContent(getPickerPopupContent(lat, lng));
        pickerMarkerRef.current.openPopup();
      }
    } else if (pickerMarkerRef.current) {
      try { pickerMarkerRef.current.remove(); } catch (e) {}
      pickerMarkerRef.current = null;
    }
  }, [pickerMode, selectedPosition?.lat, selectedPosition?.lng]);

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
        style={{
          height,
          width: '100%',
          minHeight: '260px',
          cursor: pickerMode ? 'crosshair' : 'grab',
        }}
      />
    </div>
  );
};
