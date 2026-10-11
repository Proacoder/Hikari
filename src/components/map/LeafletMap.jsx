import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG marker generator based on severity
const createMarkerIcon = (severity, category) => {
  let color = '#16a34a'; // Low (< 40)
  if (severity >= 80) color = '#dc2626'; // Critical
  else if (severity >= 60) color = '#ea580c'; // High
  else if (severity >= 40) color = '#d97706'; // Medium

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
        ${severity}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
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
  showWardCircles = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

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
      if (pickerMode && onPositionChange) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          onPositionChange({ lat, lng });
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center if changed
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update Complaint Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (!pickerMode && complaints.length > 0) {
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
  }, [complaints, pickerMode]);

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
  }, [pickerMode, selectedPosition]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%', minHeight: '300px' }}
      className={`rounded-2xl overflow-hidden shadow-soft-sm border border-neutral-200 z-10 ${className}`}
    />
  );
};
