import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  DollarSign,
  Leaf,
  Plus
} from 'lucide-react';
import { ScenarioComparisonResponse } from '../types';
import { api } from '../api/client';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const ScenariosPage: React.FC = () => {
  const [params, setParams] = useState({
    scenario_name: 'Rapid EV Adoption Wave (+25%)',
    ev_adoption_growth_percent: 25.0,
    additional_stations: 3,
    charger_power_upgrade_percent: 20.0,
    peak_tariff_surge_percent: 30.0,
    weather_condition: 'Mild / Normal (20°C)',
    weekend_shift_active: false,
  });

  const [result, setResult] = useState<ScenarioComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const evaluate = async (currentParams = params) => {
    setLoading(true);
    try {
      const res = await api.evaluateScenario(currentParams);
      setResult(res);
    } catch (err) {
      console.error('Scenario evaluation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluate();
  }, []);

  const presets = [
    {
      name: 'Aggressive Commercial EV Transition (+50%)',
      growth: 50.0,
      stations: 4,
      power: 30.0,
      tariff: 40.0,
      weather: 'Mild / Normal (20°C)',
      weekend: false,
    },
    {
      name: 'Winter Polar Vortex Heat-Pump Freeze',
      growth: 15.0,
      stations: 0,
      power: 0.0,
      tariff: 25.0,
      weather: 'Cold Snap (-10°C)',
      weekend: false,
    },
    {
      name: 'Summer Heatwave & Peaker Plant Alert',
      growth: 20.0,
      stations: 2,
      power: 15.0,
      tariff: 60.0,
      weather: 'Heat Wave (38°C)',
      weekend: false,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    const updated = {
      scenario_name: p.name,
      ev_adoption_growth_percent: p.growth,
      additional_stations: p.stations,
      charger_power_upgrade_percent: p.power,
      peak_tariff_surge_percent: p.tariff,
      weather_condition: p.weather,
      weekend_shift_active: p.weekend,
    };
    setParams(updated);
    evaluate(updated);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
            Feature 2 • Strategic Capacity Planning
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
            Counterfactual What-If Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          What-If Scenario Simulation Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Stress-test the electric distribution grid under fleet adoption shocks, infrastructure additions, and climate extremes against baseline forecasts.
        </p>
      </div>

      {/* Preset Selector Banner */}
      <div className="p-4 rounded-2xl glass-card border border-white/5 space-y-3">
        <span className="text-xs font-mono uppercase text-slate-400">One-Click Industrial Presets:</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                params.scenario_name === p.name
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-glow-cyan text-white'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>{p.name}</span>
                <span className="text-[10px] font-mono text-cyan-400">{p.weather.split(' ')[0]}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                +{p.growth}% Adoption • +{p.stations} Hubs • +{p.tariff}% Peak Tariff
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Scenario Controls + Baseline vs Scenario Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Sliders (1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Scenario Variables</span>
            </span>
            <button
              onClick={() => evaluate()}
              disabled={loading}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono"
            >
              {loading ? 'Evaluating...' : 'Apply Run'}
            </button>
          </div>

          {/* EV Adoption Growth Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">EV Fleet Growth:</span>
              <span className="text-cyan-400 font-bold">+{params.ev_adoption_growth_percent}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="100"
              step="5"
              value={params.ev_adoption_growth_percent}
              onChange={(e) => setParams({ ...params, ev_adoption_growth_percent: Number(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Additional Stations Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">New Charging Hubs:</span>
              <span className="text-emerald-400 font-bold">+{params.additional_stations} stations</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={params.additional_stations}
              onChange={(e) => setParams({ ...params, additional_stations: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Charger Power Upgrade Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Charger kW Upgrade:</span>
              <span className="text-violet-400 font-bold">+{params.charger_power_upgrade_percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={params.charger_power_upgrade_percent}
              onChange={(e) => setParams({ ...params, charger_power_upgrade_percent: Number(e.target.value) })}
              className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Peak Tariff Surge Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Peak Tariff Surcharge:</span>
              <span className="text-amber-400 font-bold">+{params.peak_tariff_surge_percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.peak_tariff_surge_percent}
              onChange={(e) => setParams({ ...params, peak_tariff_surge_percent: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Weather Condition Select */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <span className="text-xs text-slate-300 font-mono block">Weather Extreme Event:</span>
            <select
              value={params.weather_condition}
              onChange={(e) => setParams({ ...params, weather_condition: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none font-mono"
            >
              <option value="Mild / Normal (20°C)">Mild / Normal (20°C)</option>
              <option value="Cold Snap (-10°C)">Cold Snap (-10°C) — +28% Battery HVAC</option>
              <option value="Heat Wave (38°C)">Heat Wave (38°C) — +16% Chiller Strain</option>
            </select>
          </div>

          <button
            onClick={() => evaluate()}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-glow-cyan hover:opacity-95 transition-all"
          >
            {loading ? 'Simulating Dynamic Scenario...' : 'Execute What-If Analysis'}
          </button>
        </div>

        {/* Results Comparison (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Verdict Summary Card */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">{result.summary_verdict}</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Weather conditions: <strong className="text-cyan-300">{result.weather_applied}</strong>.
                  </p>
                </div>
              </div>

              {/* Side-by-Side Metric Deltas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.metrics.map((m) => (
                  <div key={m.metric} className="p-3.5 rounded-xl glass-card border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">{m.metric}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-white font-mono">
                        {m.scenario.toLocaleString()} <span className="text-xs font-normal text-slate-400">{m.unit}</span>
                      </span>
                      <span
                        className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                          m.delta >= 0
                            ? m.impact === 'positive'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                            : m.impact === 'positive'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {m.delta >= 0 ? '+' : ''}{m.delta_percent}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Baseline: {m.baseline.toLocaleString()} {m.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* 24-Hour Comparative Curve Chart (Baseline vs Scenario) */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Baseline vs Scenario 24h Demand Curve</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hour-by-hour comparative power draw showing feeder divergence.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">Comparative Delta</span>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.hourly_comparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                <p className="text-slate-400">Baseline: {p.baseline_demand_kw} kW</p>
                                <p className="text-cyan-400 font-bold">Scenario: {p.scenario_demand_kw} kW</p>
                                <p className="text-amber-400 pt-1 border-t border-white/5">
                                  Delta: +{p.delta_kw} kW ({p.delta_percent}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={32} iconType="circle" />
                      <Line
                        type="monotone"
                        dataKey="baseline_demand_kw"
                        name="Baseline Forecast (kW)"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="scenario_demand_kw"
                        name="Simulated Scenario Load (kW)"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#06b6d4' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strategic Capacity Planning Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl glass-card border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Key Findings</span>
                  {result.key_findings.map((f, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed">• {f}</p>
                  ))}
                </div>
                <div className="p-4 rounded-xl glass-card border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Capacity Actions
                  </span>
                  {result.capacity_planning_actions.map((a, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed">• {a}</p>
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
