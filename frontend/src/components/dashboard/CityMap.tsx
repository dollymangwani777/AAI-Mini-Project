import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Flame, 
  Layers
} from 'lucide-react';
import type { Incident, HeatmapPoint } from '../../types';

interface CityMapProps {
  incidents: Incident[];
  heatmapPoints: HeatmapPoint[];
  onSelectIncident: (inc: Incident) => void;
  theme?: 'light' | 'dark';
}

const createCustomMarker = (severity: string, isEscalated: boolean, reportCount: number) => {
  let color = '#10b981'; // Green (LOW)
  let ring = 'rgba(16, 185, 129, 0.4)';
  
  if (severity === 'CRITICAL') {
    color = '#ef4444'; // Red
    ring = 'rgba(239, 68, 68, 0.5)';
  } else if (severity === 'HIGH') {
    color = '#f97316'; // Orange
    ring = 'rgba(249, 115, 22, 0.4)';
  } else if (severity === 'MEDIUM') {
    color = '#eab308'; // Yellow
    ring = 'rgba(234, 179, 8, 0.4)';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        ${isEscalated ? `
          <div style="
            position: absolute;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background-color: ${ring};
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 10px;
          font-family: sans-serif;
          z-index: 10;
        ">
          ${reportCount > 1 ? reportCount : '!'}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export const CityMap: React.FC<CityMapProps> = ({
  incidents,
  heatmapPoints,
  onSelectIncident,
  theme = 'light'
}) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredIncidents = incidents.filter(inc => {
    if (selectedDept !== 'ALL' && inc.assigned_department !== selectedDept) return false;
    if (selectedSeverity !== 'ALL' && inc.severity_level !== selectedSeverity) return false;
    return true;
  });

  const departments = Array.from(new Set(incidents.map(i => i.assigned_department)));

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              Geospatial Incident Intelligence Map
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Showing {filteredIncidents.length} active civic issues across municipal wards
            </p>
          </div>
        </div>

        {/* Filters and Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
          
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
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
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Heatmap Toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showHeatmap
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Density ON' : 'Density Layer'}</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Severity:</span>
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
          <span className="text-rose-600 dark:text-rose-400 font-bold">Pulsing = SLA Escalated</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[400px] sm:h-[450px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0">
        <MapContainer
          key={theme}
          center={[28.6139, 77.2090]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
          />

          {/* Density Heatmap Circles Layer */}
          {showHeatmap && heatmapPoints.map((pt, idx) => (
            <Circle
              key={`heat-${idx}`}
              center={[pt.lat, pt.lng]}
              radius={600 * pt.weight}
              pathOptions={{
                color: pt.weight >= 0.8 ? '#ef4444' : pt.weight >= 0.5 ? '#f97316' : '#eab308',
                fillColor: pt.weight >= 0.8 ? '#ef4444' : pt.weight >= 0.5 ? '#f97316' : '#eab308',
                fillOpacity: 0.25,
                weight: 1
              }}
            />
          ))}

          {/* Markers */}
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
                  <div className="p-1 min-w-[200px] text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700 mb-1">
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{inc.ticket_number}</span>
                      <span className="font-bold text-[10px]">{inc.severity_level}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">
                      {inc.title}
                    </h4>

                    <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      <div><strong>Ward:</strong> {inc.ward_name}</div>
                      <div><strong>Dept:</strong> {inc.assigned_department}</div>
                      <div><strong>Status:</strong> {inc.status}</div>
                    </div>

                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="w-full py-1 px-2.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs text-center transition cursor-pointer"
                    >
                      Inspect Ticket
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
