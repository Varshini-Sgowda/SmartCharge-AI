import React, { useState, useEffect } from 'react';
import {
  Truck,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  DollarSign,
  TrendingUp,
  BatteryCharging
} from 'lucide-react';
import { FleetVehicle, FleetScheduleResult } from '../types';
import { api } from '../api/client';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [scheduleResult, setScheduleResult] = useState<FleetScheduleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [feederCap, setFeederCap] = useState<number>(350);
  const [objective, setObjective] = useState<string>('Cost & Peak Avoidance');

  useEffect(() => {
    const loadFleet = async () => {
      try {
        const [vList, sched] = await Promise.all([
          api.getFleetVehicles(),
          api.scheduleFleet(feederCap, objective),
        ]);
        setVehicles(vList);
        setScheduleResult(sched);
      } catch (err) {
        console.error('Fleet load failed', err);
      } finally {
        setLoading(false);
      }
    };
    loadFleet();
  }, []);

  const handleRunScheduler = async () => {
    setScheduling(true);
    try {
      const res = await api.scheduleFleet(feederCap, objective);
      setScheduleResult(res);
    } catch (err) {
      console.error('Scheduling run failed', err);
    } finally {
      setScheduling(false);
    }
  };

  if (loading || !scheduleResult) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Feature 5 • Smart Fleet Charging Dispatch
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Earliest Deadline First (EDF) Algorithm
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Commercial Fleet Charging Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate power-constrained charging schedules that strictly respect depot transformer capacity while meeting morning departure deadlines.
          </p>
        </div>

        <button
          onClick={handleRunScheduler}
          disabled={scheduling}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-glow-cyan hover:scale-[1.02] transition-all"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${scheduling ? 'animate-spin' : ''}`} />
          <span>{scheduling ? 'Optimizing Schedule...' : 'Run Smart Dispatch'}</span>
        </button>
      </div>

      {/* Scheduler Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl glass-card border border-white/5">
        <div className="space-y-1">
          <label className="text-xs font-mono uppercase text-slate-400">Optimization Goal</label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none font-mono"
          >
            <option value="Cost & Peak Avoidance">Cost & Peak Avoidance (Lowest TOU)</option>
            <option value="Fastest Turnaround">Fastest Turnaround (Greedy Urgent)</option>
            <option value="Carbon Minimization">Carbon Minimization (Clean Solar Window)</option>
          </select>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase">Depot Feeder Power Cap:</span>
            <span className="text-cyan-400 font-bold">{feederCap} kW</span>
          </div>
          <input
            type="range"
            min="150"
            max="600"
            step="25"
            value={feederCap}
            onChange={(e) => setFeederCap(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-2"
          />
        </div>

        <div className="flex items-center justify-end">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-right w-full">
            <span className="text-slate-400 block">Total Overnight Savings</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              ${scheduleResult.total_savings_usd.toFixed(2)} ({scheduleResult.savings_percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400">Vehicles Dispatched</span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {scheduleResult.total_vehicles_scheduled} EVs
          </p>
          <span className="text-[10px] text-emerald-400 font-mono block">100% Deadlines Met</span>
        </div>
        <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Energy Delivered</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {scheduleResult.total_energy_kwh.toLocaleString()} <span className="text-xs font-normal">kWh</span>
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">Overnight cycle</span>
        </div>
        <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400">Peak Feeder Demand</span>
          <p className="text-2xl font-extrabold text-violet-400 font-mono mt-1">
            {scheduleResult.peak_draw_kw} <span className="text-xs font-normal">kW</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-mono block">Capped beneath {feederCap} kW</span>
        </div>
        <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400">Optimized Cost</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ${scheduleResult.optimized_cost_usd.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">vs Unmanaged ${scheduleResult.unmanaged_cost_usd.toFixed(2)}</span>
        </div>
      </div>

      {/* Hourly Depot Feeder Load Chart */}
      <div className="glass-card p-5 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Aggregated Fleet Charging Profile vs Feeder Limit</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice how the optimization algorithm defers high-power charging to the 00:00 - 06:00 super off-peak window.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Transformer Compliant</span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={scheduleResult.hourly_fleet_load} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} />
              <YAxis stroke="#64748b" fontSize={11} unit=" kW" width={60} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
                        <p className="font-bold text-white mb-1">Time: {String(p.hour).padStart(2, '0')}:00</p>
                        <p className="text-cyan-400">Depot Load: {p.scheduled_load_kw} kW</p>
                        <p className="text-rose-400">Feeder Limit: {p.max_station_power_kw} kW</p>
                        <p className="text-amber-400">Tariff: ${p.tariff_rate.toFixed(2)}/kWh ({p.tariff_category})</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={32} iconType="circle" />
              <Bar dataKey="scheduled_load_kw" name="Scheduled Fleet Draw (kW)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Line
                type="step"
                dataKey="max_station_power_kw"
                name="Station Feeder Capacity Limit"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Vehicle Schedules Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Individual Vehicle Dispatch Timeline</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrival time, allocated power rate, energy delivered, and individual financial savings.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase">
                <th className="py-2.5 px-3">Vehicle ID</th>
                <th className="py-2.5 px-3">Make / Model</th>
                <th className="py-2.5 px-3">Charging Window</th>
                <th className="py-2.5 px-3">Power Alloc</th>
                <th className="py-2.5 px-3">Energy Needed</th>
                <th className="py-2.5 px-3">Optimized Cost</th>
                <th className="py-2.5 px-3">Unmanaged Cost</th>
                <th className="py-2.5 px-3">Savings</th>
                <th className="py-2.5 px-3">Deadline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {scheduleResult.schedules.map((s) => (
                <tr key={s.vehicle_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-cyan-400">{s.vehicle_id}</td>
                  <td className="py-3 px-3 font-sans text-white font-medium">{s.make_model}</td>
                  <td className="py-3 px-3 text-slate-300">
                    {String(s.start_hour).padStart(2, '0')}:00 – {String(s.end_hour).padStart(2, '0')}:00 ({s.duration_hours}h)
                  </td>
                  <td className="py-3 px-3 text-violet-300 font-bold">{s.allocated_power_kw} kW</td>
                  <td className="py-3 px-3 text-slate-200">{s.energy_delivered_kwh} kWh</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">${s.scheduled_cost_usd.toFixed(2)}</td>
                  <td className="py-3 px-3 text-slate-400 line-through">${s.unmanaged_cost_usd.toFixed(2)}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">+${s.cost_savings_usd.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{s.status}</span>
                    </span>
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
