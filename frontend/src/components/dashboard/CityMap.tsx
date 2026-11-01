import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Filter, 
  Flame, 
  Clock, 
  Building2,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { Incident, HeatmapPoint } from '../../types';

interface CityMapProps {
  incidents: Incident[];
  heatmapPoints: HeatmapPoint[];
  onSelectIncident: (inc: Incident) => void;
}

// Custom Leaflet DivIcon generator for color-coded severity & pulsing markers
const createCustomMarker = (severity: string, isEscalated: boolean, reportCount: number) => {
  let color = '#10b981'; // Green (LOW)
  let ring = 'rgba(16, 185, 129, 0.4)';
  
  if (severity === 'CRITICAL') {
    color = '#f43f5e'; // Rose / Red
    ring = 'rgba(244, 63, 94, 0.6)';
  } else if (severity === 'HIGH') {
    color = '#f97316'; // Orange / Amber
    ring = 'rgba(249, 115, 22, 0.5)';
  } else if (severity === 'MEDIUM') {
    color = '#eab308'; // Yellow
    ring = 'rgba(234, 179, 8, 0.5)';
  }

  const pulseClass = isEscalated ? 'animate-ping' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        ${isEscalated ? `
          <div style="
            position: absolute;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: ${ring};
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
          font-family: sans-serif;
          z-index: 10;
        ">
          ${reportCount > 1 ? reportCount : '!'}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

export const CityMap: React.FC<CityMapProps> = ({
  incidents,
  heatmapPoints,
  onSelectIncident
}) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Filtered incidents for map display
  const filteredIncidents = incidents.filter(inc => {
    if (selectedDept !== 'ALL' && inc.assigned_department !== selectedDept) return false;
    if (selectedSeverity !== 'ALL' && inc.severity_level !== selectedSeverity) return false;
    return true;
  });

  const departments = Array.from(new Set(incidents.map(i => i.assigned_department)));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Geospatial Incident Intelligence Map
            </h3>
            <p className="text-xs text-slate-400">
              {filteredIncidents.length} active issue pinpoints mapped across municipal wards
            </p>
          </div>
        </div>

        {/* Filters and Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical (Pulsing Red)</option>
            <option value="HIGH">High (Orange)</option>
            <option value="MEDIUM">Medium (Yellow)</option>
            <option value="LOW">Low (Green)</option>
          </select>

          {/* Heatmap Toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showHeatmap
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Heatmap ON' : 'Toggle Density Heatmap'}</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 px-2 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
        <span className="font-semibold text-slate-300">Legend:</span>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Critical</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping"></span>
          <span className="text-rose-400 font-bold">Pulsing = Escalated</span>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="w-full h-[450px] sm:h-[500px] rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Heatmap / Density Circles Layer */}
          {showHeatmap && heatmapPoints.map((pt, idx) => (
            <Circle
              key={`heat-${idx}`}
              center={[pt.lat, pt.lng]}
              radius={700 * pt.weight}
              pathOptions={{
                color: pt.weight >= 0.8 ? '#f43f5e' : pt.weight >= 0.5 ? '#f97316' : '#eab308',
                fillColor: pt.weight >= 0.8 ? '#f43f5e' : pt.weight >= 0.5 ? '#f97316' : '#eab308',
                fillOpacity: 0.35,
                weight: 1
              }}
            />
          ))}

          {/* Map Pins */}
          {filteredIncidents.map((inc) => {
            const isEscalated = inc.escalation_level > 0;
            const markerIcon = createCustomMarker(inc.severity_level, isEscalated, inc.reported_by_count);

            return (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="p-1 min-w-[220px] text-xs font-sans">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-1.5">
                      <span className="font-mono font-bold text-sky-400">{inc.ticket_number}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        inc.severity_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300' :
                        inc.severity_level === 'HIGH' ? 'bg-amber-950 text-amber-300' :
                        'bg-sky-950 text-sky-300'
                      }`}>
                        {inc.severity_level}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm mb-1 leading-snug">
                      {inc.title}
                    </h4>

                    <p className="text-slate-300 text-[11px] mb-2 line-clamp-2">
                      {inc.raw_description}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-400 mb-2.5">
                      <div><strong className="text-slate-300">Ward:</strong> {inc.ward_name}</div>
                      <div><strong className="text-slate-300">Dept:</strong> {inc.assigned_department}</div>
                      <div>
                        <strong className="text-slate-300">Status:</strong>{' '}
                        <span className={inc.is_sla_breached ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {inc.status} {inc.is_sla_breached && '(SLA Breached)'}
                        </span>
                      </div>
                      {inc.reported_by_count > 1 && (
                        <div className="text-amber-400 font-semibold">
                          ★ {inc.reported_by_count} Repeated Reports Clustered
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs text-center transition"
                    >
                      Inspect & Resolve Ticket
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
};
