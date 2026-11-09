import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Sun,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Info,
  Trees,
  BatteryCharging,
  Zap
} from 'lucide-react';
import { CarbonData } from '../types';
import { api } from '../api/client';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const CarbonPage: React.FC = () => {
  const [data, setData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarbon = async () => {
      try {
        const res = await api.getCarbonIntelligence();
        setData(res);
      } catch (err) {
        console.error('Carbon fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCarbon();
  }, []);

  if (loading || !data) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-400">
            ESG & Sustainability Analytics
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            EPA & CAISO Marginal Emission Factor Model
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Carbon Intelligence & Decarbonization Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track lifecycle EV carbon displacement against ICE tailpipe baselines and identify green solar surplus charging windows.
        </p>
      </div>

      {/* Engineering Methodology Transparency Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Methodology Transparency: </strong>
          {data.data_source_disclosure}
        </div>
      </div>

      {/* Core ESG Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/5 text-center">
          <span className="text-xs text-slate-400 font-mono uppercase">Net Carbon Avoided</span>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {data.net_carbon_avoided_kg.toLocaleString()} <span className="text-xs font-normal">kg</span>
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">vs ICE gasoline tailpipe emissions</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 text-center">
          <span className="text-xs text-slate-400 font-mono uppercase">Decarbonization Rate</span>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
            {data.decarbonization_rate_percent}%
          </p>
          <span className="text-[10px] text-emerald-400 mt-1 block">Cleaner than internal combustion</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 text-center">
          <span className="text-xs text-slate-400 font-mono uppercase">Clean Charging Window</span>
          <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {data.clean_charging_window}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">Solar surplus drops grid factor to 0.210</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 text-center">
          <span className="text-xs text-slate-400 font-mono uppercase">Equivalent Trees Planted</span>
          <p className="text-3xl font-extrabold text-emerald-300 font-mono mt-1">
            {Math.round(data.net_carbon_avoided_kg / 21.77).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">Annual tree absorption equivalents</span>
        </div>
      </div>

      {/* 24-Hour Carbon Intensity Curve Chart */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>24-Hour Grid Marginal Carbon Intensity (kg CO₂/kWh)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              California grid solar overgeneration drives midday carbon emissions down by 55% compared to evening thermal peaker plants.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Solar Window: 10:00 - 15:00</span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourly_carbon_curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} />
              <YAxis stroke="#64748b" fontSize={11} unit=" kg" width={55} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
                        <p className="font-bold text-white mb-1">Time: {String(p.hour).padStart(2, '0')}:00</p>
                        <p className="text-emerald-400 font-bold">Intensity: {p.carbon_intensity_kg_kwh} kg CO₂/kWh</p>
                        <p className="text-cyan-400">Total Emissions: {p.hourly_emissions_kg} kg</p>
                        <p className="text-amber-400 text-[10px] mt-1 pt-1 border-t border-white/10">{p.grid_source_mix}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="carbon_intensity_kg_kwh"
                name="Grid Carbon Intensity"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#carbonGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decarbonization Action Scenarios */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Targeted Decarbonization Initiatives</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Actionable infrastructure interventions to achieve net-zero charging operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.reduction_scenarios.map((scen, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-white block">{scen.name}</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{scen.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">CO₂ Abatement</span>
                  <span className="text-emerald-400 font-bold">-{scen.emissions_reduction_kg.toLocaleString()} kg</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Tree Equiv</span>
                  <span className="text-cyan-400 font-bold">+{scen.equivalent_trees_planted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
