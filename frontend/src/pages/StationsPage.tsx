import React, { useState, useEffect } from 'react';
import { Station } from '../types';
import { api } from '../api/client';
import { AlertBadge } from '../components/common/AlertBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MapPin,
  ExternalLink,
  Plus
} from 'lucide-react';

export const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await api.getStations();
        setStations(data);
      } catch (err) {
        console.error('Failed to load stations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  if (loading) return <LoadingSkeleton rows={4} />;

  const regions = ['All', ...Array.from(new Set(stations.map((s) => s.region)))];

  const filtered = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.station_id.toLowerCase().includes(search.toLowerCase()) ||
      s.region.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || s.region === selectedRegion;
    const matchesRisk = selectedRisk === 'All' || s.risk_level === selectedRisk;
    return matchesSearch && matchesRegion && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Infrastructure Asset Registry
            </span>
            <span className="text-xs font-mono text-slate-500">• {stations.length} Monitored Facilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Charging Station Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time power ratings, connector specifications, capacity limits, and operational health status.
          </p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="p-4 rounded-xl glass-card border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by station name, ID, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none font-mono"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none font-mono"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stations Table */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Station ID</th>
                <th className="py-3 px-4">Station Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Hardware Rating</th>
                <th className="py-3 px-4">Stalls</th>
                <th className="py-3 px-4">Current Load</th>
                <th className="py-3 px-4">Utilization</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filtered.map((st) => (
                <tr key={st.station_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{st.station_id}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-white max-w-[200px] truncate">
                    {st.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-sans">{st.region}</td>
                  <td className="py-3.5 px-4 text-slate-200">{st.charger_type}</td>
                  <td className="py-3.5 px-4 text-slate-300">{st.total_ports} Ports</td>
                  <td className="py-3.5 px-4 text-white font-bold">
                    {st.current_load_kw} / {st.max_power_kw} kW
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            st.utilization_rate >= 80
                              ? 'bg-rose-500'
                              : st.utilization_rate >= 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, st.utilization_rate)}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{st.utilization_rate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <AlertBadge level={st.risk_level} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-300 text-[11px] max-w-xs">
                    {st.recommended_action || 'Nominal operation.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
