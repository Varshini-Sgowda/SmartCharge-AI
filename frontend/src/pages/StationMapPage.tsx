import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '../types';
import { api } from '../api/client';
import { AlertBadge } from '../components/common/AlertBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  MapPin,
  Zap,
  Activity,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

// Create custom glowing Leaflet markers
const createCustomIcon = (risk: string) => {
  const colorMap: Record<string, string> = {
    Low: '#10b981',
    Moderate: '#06b6d4',
    High: '#f59e0b',
    Critical: '#f43f5e',
  };
  const color = colorMap[risk] || '#06b6d4';

  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; background: #0f172a; border: 2.5px solid ${color}; box-shadow: 0 0 12px ${color}; display: flex; align-items: center; justify-content: center;">
        <div style="width: 7px; height: 7px; border-radius: 50%; background: ${color};"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const StationMapPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await api.getStations();
        setStations(data);
        if (data.length > 0) setSelectedStation(data[0]);
      } catch (err) {
        console.error('Failed to load stations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  const filteredStations = stations.filter((st) => {
    const matchesRisk = filterRisk === 'All' || st.risk_level === filterRisk;
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.station_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Interactive Geospatial Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Charging Station Geospatial Digital Twin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live telemetry, color-coded capacity stress markers, and regional load redistribution.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Low (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Moderate (40-75%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>High (75-85%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Overload (&gt;85%)</span>
          </div>
        </div>
      </div>

      {/* Main Map + Station Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (Col Span 2) */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[640px]">
          {/* Map Sub-Header Search & Filters */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-slate-900/60 z-10">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hub name or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-xs text-slate-300 focus:outline-none font-mono"
              >
                <option value="All">All Risk Levels ({stations.length})</option>
                <option value="Critical">Critical Overload</option>
                <option value="High">High Strain</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low / Underutilized</option>
              </select>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="flex-1 w-full relative z-0">
            <MapContainer
              center={[37.73, -122.3]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {filteredStations.map((st) => (
                <Marker
                  key={st.station_id}
                  position={[st.latitude, st.longitude]}
                  icon={createCustomIcon(st.risk_level)}
                  eventHandlers={{
                    click: () => setSelectedStation(st),
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-white">{st.name}</span>
                        <AlertBadge level={st.risk_level} size="sm" />
                      </div>
                      <p className="text-slate-400 text-[11px]">{st.region}</p>
                      <div className="pt-1 border-t border-white/10 font-mono text-[11px] space-y-0.5">
                        <p className="text-cyan-400">Current Load: {st.current_load_kw} kW</p>
                        <p className="text-slate-300">Max Capacity: {st.max_power_kw} kW</p>
                        <p className="font-bold text-amber-400">Stress: {st.utilization_rate}%</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Selected Station Deep-Dive Drawer (Col Span 1) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[640px] overflow-y-auto">
          {selectedStation ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {selectedStation.station_id}
                  </span>
                  <AlertBadge level={selectedStation.risk_level} />
                </div>
                <h2 className="text-xl font-extrabold text-white">{selectedStation.name}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{selectedStation.address || `${selectedStation.region}, CA`}</span>
                </p>
              </div>

              {/* Station Metric Gauges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Current Load</span>
                  <p className="text-2xl font-extrabold text-white font-mono mt-1">
                    {selectedStation.current_load_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </p>
                  <span className="text-[10px] text-slate-500 block">Rated: {selectedStation.max_power_kw} kW</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Utilization Rate</span>
                  <p
                    className={`text-2xl font-extrabold font-mono mt-1 ${
                      selectedStation.utilization_rate >= 80
                        ? 'text-rose-400'
                        : selectedStation.utilization_rate >= 60
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedStation.utilization_rate}%
                  </p>
                  <span className="text-[10px] text-slate-500 block">Transformer Stress</span>
                </div>
              </div>

              {/* Hardware Specs */}
              <div className="space-y-2 text-xs font-mono bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Charger Hardware:</span>
                  <span className="text-white font-bold">{selectedStation.charger_type}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Charging Stalls:</span>
                  <span className="text-cyan-400 font-bold">{selectedStation.total_ports} Concurrent Ports</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Status & Telemetry:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Online / Synced
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-slate-300">
                    {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                <div className="flex items-center gap-2 mb-1.5 text-cyan-300 font-bold">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>AI Recommended Action:</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {selectedStation.recommended_action || 'Nominal operation; continue real-time temperature tracking.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <MapPin className="w-10 h-10 mb-2 opacity-50 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-300">Select a Charging Station</p>
              <p className="text-xs text-slate-500 mt-1">Click on any map marker to view detailed telemetry</p>
            </div>
          )}

          {/* Quick List Footer */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-[11px] text-slate-400 font-mono mb-2">Nearby Station Hubs:</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {filteredStations.slice(0, 4).map((st) => (
                <div
                  key={st.station_id}
                  onClick={() => setSelectedStation(st)}
                  className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selectedStation?.station_id === st.station_id
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                      : 'hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className="font-medium truncate">{st.name}</span>
                  <span className="font-mono text-[10px]">{st.utilization_rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
