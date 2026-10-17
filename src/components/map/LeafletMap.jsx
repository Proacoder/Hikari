import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MUMBAI_WARDS_GEOJSON, getWardHeatmapStyle } from '../../utils/mumbaiWardsGeo';
import { classNames } from '../../utils/formatters';

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
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const [mapViewMode, setMapViewMode] = useState('pins'); // 'pins' | 'wards'
  const centerLat = center?.[0];
  const centerLng = center?.[1];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
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
      let clickHandler = null;
      if (pickerMode && onPositionChange) {
        clickHandler = (e) => {
          const { lat, lng } = e.latlng;
          onPositionChange({ lat, lng });
        };
        map.on('click', clickHandler);
      }

      // Store click handler for cleanup
      mapInstanceRef.current._pickerClickHandler = clickHandler;
    }

    return () => {
      if (mapInstanceRef.current) {
        // Remove picker mode click handler if it exists
        if (mapInstanceRef.current._pickerClickHandler) {
          mapInstanceRef.current.off('click', mapInstanceRef.current._pickerClickHandler);
          mapInstanceRef.current._pickerClickHandler = null;
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, onPositionChange, pickerMode, zoom]);

  // Update Center if changed
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [centerLat, centerLng, zoom, center]);

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

        const popupContent = `
          <div style="padding: 12px; font-family: Inter, sans-serif; max-width: 250px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #16a34a; letter-spacing: 0.5px;">${c.category}</span>
              <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background-color: #f1f5f9; color: #475569;">${c.status}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">${c.title}</h4>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              <span>Ward: <strong>${c.ward}</strong></span> · <span>Severity: <strong>${c.severity}/100</strong></span>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: #64748b;">👍 ${c.upvoteCount || 0} Upvotes</span>
              <a href="/app/complaint/${c.id}" style="font-size: 11px; color: #16a34a; font-weight: 600; text-decoration: none;">View Details →</a>
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

    if (pickerMode && selectedPosition) {
      if (!pickerMarkerRef.current) {
        const marker = L.marker([selectedPosition.lat, selectedPosition.lng], {
          icon: createPickerIcon(),
          draggable: true
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          if (onPositionChange) {
            onPositionChange({ lat: position.lat, lng: position.lng });
          }
        });

        pickerMarkerRef.current = marker;
      } else {
        pickerMarkerRef.current.setLatLng([selectedPosition.lat, selectedPosition.lng]);
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickerMode, selectedPosition, onPositionChange]);

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
        style={{ height, width: '100%', minHeight: '300px' }}
      />
    </div>
  );
};
