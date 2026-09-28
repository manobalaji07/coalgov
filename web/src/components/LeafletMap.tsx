import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MineMapData {
  id: string;
  name: string;
  code: string;
  mine_type: string;
  latitude: number;
  longitude: number;
  district: string;
  risk_level?: string;
  risk_score?: number;
}

interface LeafletMapProps {
  mines: MineMapData[];
  selectedMineId?: string;
  onSelectMine?: (mineId: string) => void;
  height?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ mines, selectedMineId, onSelectMine, height = '450px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: India coal belt (Jharkhand / Chhattisgarh)
      const map = L.map(mapRef.current).setView([23.5, 84.5], 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    if (mines.length === 0) return;

    const bounds = L.latLngBounds([]);

    mines.forEach((m) => {
      const isSelected = m.id === selectedMineId;
      const riskColor = m.risk_level === 'CRITICAL' ? '#EF4444' :
                        m.risk_level === 'HIGH' ? '#F97316' :
                        m.risk_level === 'MEDIUM' ? '#EAB308' : '#10B981';

      // Custom HTML Marker Icon
      const markerHtml = `
        <div style="
          background-color: ${riskColor};
          width: ${isSelected ? '28px' : '20px'};
          height: ${isSelected ? '28px' : '20px'};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 10px ${riskColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        ">
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-mine-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([m.latitude, m.longitude], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; font-weight: bold; color: #0F172A;">${m.name} (${m.code})</h4>
          <p style="margin: 4px 0; font-size: 12px; color: #475569;"><b>Type:</b> ${m.mine_type} | <b>District:</b> ${m.district}</p>
          ${m.risk_score !== undefined ? `<p style="margin: 4px 0; font-size: 12px;"><b>Risk Score:</b> <span style="color:${riskColor}; font-weight:bold;">${m.risk_score} (${m.risk_level})</span></p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectMine) onSelectMine(m.id);
      });

      bounds.extend([m.latitude, m.longitude]);
    });

    if (mines.length > 0 && !selectedMineId) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mines, selectedMineId]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700 p-2.5 rounded-lg text-xs z-[1000] text-slate-300 shadow-lg">
        <div className="font-semibold text-white mb-1">Mine Risk Index Legend:</div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical</span>
        </div>
      </div>
    </div>
  );
};
