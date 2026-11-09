import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Clock,
  BatteryCharging,
  DollarSign,
  Leaf,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SimulationRequest, SimulationResult } from '../types';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const DigitalTwinPage: React.FC = () => {
  const [params, setParams] = useState<SimulationRequest>({
    num_evs: 450,
    num_stations: 12,
    charger_capacity_kw: 150,
    arrival_rate_per_hour: 35,
    avg_charging_duration_min: 35,
    peak_multiplier: 1.4,
    battery_storage_kw: 100,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  const runSim = async (currentParams = params) => {
    setRunning(true);
    try {
      const res = await api.runSimulation(currentParams);
      setResult(res);
    } catch (err) {
      console.error('Simulation execution failed', err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runSim();
  }, []);

  const handleReset = () => {
    const defaults: SimulationRequest = {
      num_evs: 450,
      num_stations: 12,
      charger_capacity_kw: 150,
      arrival_rate_per_hour: 35,
      avg_charging_duration_min: 35,
      peak_multiplier: 1.4,
      battery_storage_kw: 100,
    };
    setParams(defaults);
    runSim(defaults);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Feature 1 • In-Silico Power Flow Lab
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Physics & Queuing Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            EV Energy Digital Twin Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Adjust fleet parameters, arrival Poisson distributions, and onsite battery storage to evaluate grid strain before real deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => runSim()}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-glow-cyan hover:scale-[1.02] transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Running Simulation...' : 'Re-Simulate Twin'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Control Panel + Results Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Simulation Control Sliders (1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Digital Twin Inputs</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Live Calibration</span>
          </div>

          {/* Slider 1: Number of EVs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Active EV Fleet Size:</span>
              <span className="text-cyan-400 font-bold">{params.num_evs} vehicles</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={params.num_evs}
              onChange={(e) => setParams({ ...params, num_evs: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50 EVs</span>
              <span>2,000 EVs</span>
            </div>
          </div>

          {/* Slider 2: Number of Stations */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Active Charging Hubs:</span>
              <span className="text-emerald-400 font-bold">{params.num_stations} hubs</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={params.num_stations}
              onChange={(e) => setParams({ ...params, num_stations: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 Hubs</span>
              <span>25 Hubs</span>
            </div>
          </div>

          {/* Slider 3: Charger kW Capacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Charger Rating per Stall:</span>
              <span className="text-violet-400 font-bold">{params.charger_capacity_kw} kW</span>
            </div>
            <input
              type="range"
              min="22"
              max="350"
              step="10"
              value={params.charger_capacity_kw}
              onChange={(e) => setParams({ ...params, charger_capacity_kw: Number(e.target.value) })}
              className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>22 kW (L2)</span>
              <span>350 kW (HPC)</span>
            </div>
          </div>

          {/* Slider 4: Hourly Arrival Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Mean EV Arrival Rate:</span>
              <span className="text-amber-400 font-bold">{params.arrival_rate_per_hour} EVs/hr</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={params.arrival_rate_per_hour}
              onChange={(e) => setParams({ ...params, arrival_rate_per_hour: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 EVs/hr</span>
              <span>150 EVs/hr</span>
            </div>
          </div>

          {/* Slider 5: Average Charging Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Avg Session Duration:</span>
              <span className="text-cyan-400 font-bold">{params.avg_charging_duration_min} mins</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={params.avg_charging_duration_min}
              onChange={(e) => setParams({ ...params, avg_charging_duration_min: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>15 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Slider 6: Peak Hour Multiplier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Peak Load Multiplier:</span>
              <span className="text-rose-400 font-bold">{params.peak_multiplier}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={params.peak_multiplier}
              onChange={(e) => setParams({ ...params, peak_multiplier: Number(e.target.value) })}
              className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.8x (Flat)</span>
              <span>2.5x (Severe)</span>
            </div>
          </div>

          {/* Slider 7: Battery Energy Storage System (BESS) */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-300 font-semibold">Onsite BESS Storage:</span>
              <span className="text-emerald-400 font-bold">{params.battery_storage_kw} kW</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={params.battery_storage_kw}
              onChange={(e) => setParams({ ...params, battery_storage_kw: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 kW (No battery)</span>
              <span>500 kW (Industrial)</span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Outputs & Curves (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Output KPIs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Peak Power Load</span>
                  <p className="text-2xl font-extrabold text-white font-mono mt-1">
                    {result.peak_demand_kw.toLocaleString()} <span className="text-xs font-normal">kW</span>
                  </p>
                  <span className="text-[10px] text-cyan-400 font-mono block">Hour: {String(result.peak_hour).padStart(2, '0')}:00</span>
                </div>

                <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Avg Utilization</span>
                  <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                    {result.avg_station_utilization_percent}%
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block">Station Capacity</span>
                </div>

                <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Overload Probability</span>
                  <p
                    className={`text-2xl font-extrabold font-mono mt-1 ${
                      result.overload_probability_percent >= 20 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.overload_probability_percent}%
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block">Grid Strain Likelihood</span>
                </div>

                <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Avg Queue Wait</span>
                  <p className="text-2xl font-extrabold text-violet-400 font-mono mt-1">
                    {result.avg_queue_delay_minutes} <span className="text-xs font-normal">min</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block">Driver Delay</span>
                </div>
              </div>

              {/* Simulation Curve Chart */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>24-Hour Simulated Power Profile & BESS Peak Shaving</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Grid draw (cyan), battery discharge support (green), and queuing delay.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">
                    BESS Saved: ${result.bess_cost_savings_usd.toFixed(2)}/day
                  </span>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={result.hourly_simulation}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} />
                      <YAxis stroke="#64748b" fontSize={11} unit=" kW" width={60} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
                                <p className="font-bold text-white mb-1">Hour: {String(p.hour).padStart(2, '0')}:00</p>
                                <p className="text-cyan-400">Grid Load: {p.grid_demand_kw} kW</p>
                                <p className="text-emerald-400">BESS Output: {p.bess_discharge_kw} kW</p>
                                <p className="text-amber-400">Queue Wait: {p.queue_wait_min} mins</p>
                                <p className="text-violet-400">Utilization: {p.utilization_rate}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={32} iconType="circle" />
                      <Area
                        type="monotone"
                        dataKey="grid_demand_kw"
                        name="Grid Demand (kW)"
                        fill="#06b6d4"
                        fillOpacity={0.25}
                        stroke="#06b6d4"
                        strokeWidth={2}
                      />
                      <Bar
                        dataKey="bess_discharge_kw"
                        name="BESS Battery Discharge (kW)"
                        fill="#10b981"
                        radius={[3, 3, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="queue_wait_min"
                        name="Driver Queue Wait (min)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI System Recommendations */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Digital Twin Automated Engineering Recommendations</span>
                </div>
                <div className="space-y-2">
                  {result.system_recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <LoadingSkeleton rows={3} />
          )}
        </div>
      </div>
    </div>
  );
};
