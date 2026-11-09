import React, { useState, useEffect } from 'react';
import {
  Zap,
  DollarSign,
  TrendingDown,
  Leaf,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { OptimizerData } from '../types';
import { api } from '../api/client';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const OptimizerPage: React.FC = () => {
  const [sessionKwh, setSessionKwh] = useState<number>(50);
  const [data, setData] = useState<OptimizerData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOptimizer = async (kwh: number) => {
    try {
      const res = await api.getOptimizerData(kwh);
      setData(res);
    } catch (err) {
      console.error('Failed to load optimizer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizer(sessionKwh);
  }, [sessionKwh]);

  if (loading || !data) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Feature 4 • Economic Load Shifting
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              TOU Tariff Arbitrage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tariff-Aware Smart Charging Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmically identify optimal charging windows, avoid demand ratchet surcharges, and maximize solar self-consumption.
          </p>
        </div>

        {/* Reference Session Slider */}
        <div className="p-3 rounded-xl glass-card border border-white/10 flex items-center gap-4">
          <div className="text-left font-mono">
            <span className="text-[10px] uppercase text-slate-400 block">Session Target:</span>
            <span className="text-sm font-bold text-white">{sessionKwh} kWh</span>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={sessionKwh}
            onChange={(e) => setSessionKwh(Number(e.target.value))}
            className="w-28 sm:w-36 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Main Highlights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Cheapest Economic Window */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              SAVINGS: {data.savings_percentage}%
            </span>
          </div>
          <p className="text-xs font-mono uppercase text-slate-400">Cheapest Charging Window</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{data.cheapest_window}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Rate: ${data.cheapest_rate_per_kwh.toFixed(2)}/kWh</span>
            <span className="text-emerald-400 font-bold">Cost: ${data.estimated_session_cost_cheapest.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 2: Peak Avoidance Window */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
              HIGH STRAIN SURCHARGE
            </span>
          </div>
          <p className="text-xs font-mono uppercase text-slate-400">Peak Window (Avoid)</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{data.peak_window}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Rate: ${data.peak_rate_per_kwh.toFixed(2)}/kWh</span>
            <span className="text-rose-400 font-bold">Cost: ${data.estimated_session_cost_peak.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 3: Cleanest Solar Window */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
              SOLAR SURPLUS
            </span>
          </div>
          <p className="text-xs font-mono uppercase text-slate-400">Cleanest Green Window</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{data.cleanest_green_window}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Intensity: {data.cleanest_carbon_intensity} kg/kWh</span>
            <span className="text-cyan-400 font-bold">Saves {data.carbon_saved_kg_per_session} kg CO₂</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Tariff vs Grid Carbon Intensity Curve */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">24-Hour Electricity Tariff & Carbon Intensity Curve</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice the solar valley between 11:00-14:00 where regional renewables depress carbon intensity.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Dynamic TOU Profile</span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourly_price_carbon_profile} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tariffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} />
              <YAxis stroke="#64748b" fontSize={11} unit=" $/kWh" width={65} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
                        <p className="font-bold text-white mb-1">Time: {String(p.hour).padStart(2, '0')}:00</p>
                        <p className="text-amber-400">Tariff: ${p.tariff_rate.toFixed(2)}/kWh ({p.tariff_period})</p>
                        <p className="text-cyan-400">Carbon: {p.carbon_intensity.toFixed(3)} kg CO₂/kWh</p>
                        <p className="text-slate-300">Demand: {p.demand_kw} kW</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="stepAfter"
                dataKey="tariff_rate"
                name="Utility Electricity Tariff ($/kWh)"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#tariffGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spatial Station Load Balancing Recommendations */}
      {data.load_balancing_pairs.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Spatial Load Balancing Opportunities</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated routing recommendations to shift vehicle arrivals from congested hubs to nearby underutilized facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.load_balancing_pairs.map((pair, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-400">Congested: {pair.congested_station} ({pair.congested_utilization}%)</span>
                  <span className="font-mono text-cyan-400">→</span>
                  <span className="font-bold text-emerald-400">Alternative: {pair.alternative_station} ({pair.alternative_utilization}%)</span>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-xs text-cyan-300 flex items-center justify-between">
                  <span>{pair.proposed_incentive}</span>
                  <span className="font-mono font-bold">Diverts ~{pair.estimated_load_diverted_kw} kW</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prioritized AI Recommendations List */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Intelligent Energy Recommendations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Derived algorithmically from 24-hour demand forecasts, historical station utilization, and utility tariff schedules.
          </p>
        </div>

        <div className="space-y-3">
          {data.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {rec.id}
                  </span>
                  <span className="font-bold text-sm text-white">{rec.title}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      rec.priority === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300'
                        : rec.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{rec.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-500 block">Est Financial Impact</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{rec.potential_savings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
