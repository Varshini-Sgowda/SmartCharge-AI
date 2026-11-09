import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  BatteryCharging,
  Leaf,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Activity,
  BarChart2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { AlertBadge } from '../components/common/AlertBadge';
import { DemandChart } from '../components/charts/DemandChart';
import { HeatmapChart } from '../components/charts/HeatmapChart';
import { EnergyBarChart } from '../components/charts/EnergyBarChart';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { DashboardMetrics, DashboardVisualizations } from '../types';
import { api } from '../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [viz, setViz] = useState<DashboardVisualizations | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [m, v] = await Promise.all([api.getMetrics(), api.getVisualizations()]);
      setMetrics(m);
      setViz(v);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !metrics || !viz) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Title & Refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Live Operations Room
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Executive EV Energy Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry, machine-learning demand forecast, and regional grid capacity intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 border border-white/5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('forecasting')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Deep Forecasting Engine</span>
          </button>
        </div>
      </div>

      {/* Critical Overload Alert Banner */}
      {metrics.overload_risk_stations_count > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-300">
                  Peak Overload Risk Warning: {metrics.overload_risk_stations_count} Station(s) Approaching Saturation
                </span>
                <AlertBadge level="High" size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Silicon Metro Hub and Airport Terminal are projected to cross 85% transformer load between{' '}
                <strong className="text-white font-mono">{metrics.peak_demand_time_window}</strong>. We recommend engaging BESS battery peak shaving or routing incoming drivers to underutilized hubs.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('optimizer')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 shrink-0 transition-colors"
          >
            <span>Resolve Load</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Grid Demand"
          value={metrics.current_demand_kw.toLocaleString()}
          unit="kW"
          subtitle="Real-time measured load"
          icon={Activity}
          trend={{ value: 4.8, isPositive: true, label: 'vs last hour' }}
          accentColor="cyan"
        />
        <StatCard
          title="Next-Day Peak Forecast"
          value={metrics.forecasted_peak_demand_kw.toLocaleString()}
          unit="kW"
          subtitle={`Window: ${metrics.peak_demand_time_window}`}
          icon={TrendingUp}
          trend={{ value: 12.3, isPositive: false, label: 'ML projected surge' }}
          accentColor="rose"
        />
        <StatCard
          title="Average Station Utilization"
          value={metrics.average_station_utilization_percent}
          unit="%"
          subtitle={`Across ${metrics.total_stations} stations (${metrics.total_ports} ports)`}
          icon={BatteryCharging}
          accentColor="amber"
        />
        <StatCard
          title="Daily Carbon Avoided"
          value={Math.round(metrics.daily_energy_consumption_kwh * 0.46).toLocaleString()}
          unit="kg CO₂"
          subtitle="Net displacement vs ICE tailpipe"
          icon={Leaf}
          trend={{ value: 8.5, isPositive: true, label: 'Clean energy mix' }}
          accentColor="emerald"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl glass-card border border-white/5 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Total Monitored Stations</span>
          <span className="text-lg font-bold text-white font-mono">{metrics.total_stations} Hubs</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Historical EV Sessions</span>
          <span className="text-lg font-bold text-cyan-400 font-mono">{metrics.total_charging_sessions.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">RandomForest R² Fit</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{metrics.model_r2_score.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Forecasting MAE</span>
          <span className="text-lg font-bold text-violet-400 font-mono">{metrics.model_mae_kw} kW</span>
        </div>
      </div>

      {/* Visualization Grid Row 1: Actual vs Predicted Demand & Hourly Energy Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Actual vs Predicted Demand with 95% Confidence Interval */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Actual vs Predicted EV Charging Demand</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  95% Confidence Interval
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hourly multi-step autoregressive model projection over 24 hours.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('forecasting')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Model Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <DemandChart data={viz.actual_vs_predicted} showConfidenceInterval={true} />
        </div>

        {/* Chart 2: Hourly Energy Consumption & TOU Pricing */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white">Hourly Energy (kWh)</h2>
              <span className="text-[10px] font-mono text-slate-400">TOU Tariffs</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Bars color-coded by tariff: <span className="text-emerald-400 font-bold">Green</span> (Off-peak $0.14), <span className="text-cyan-400 font-bold">Cyan</span> (Mid-peak $0.22), <span className="text-rose-400 font-bold">Rose</span> (Peak $0.44).
            </p>
            <EnergyBarChart data={viz.hourly_energy} />
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Peak Window Surcharge:</span>
            <span className="text-rose-400 font-bold">+214% vs Off-Peak</span>
          </div>
        </div>
      </div>

      {/* Visualization Grid Row 2: Peak Demand Heatmap & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 4: Peak Demand Heatmap (24 hours x 7 days) */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Peak Demand Intensity Heatmap</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  24h × 7 Days
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated empirical session density across weekly commuter and weekend cycles.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Grid Strain Index</span>
          </div>
          <HeatmapChart data={viz.heatmap} />
        </div>

        {/* Chart 5: Charging Demand by Region */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Demand by Geographic Region</h2>
            <p className="text-xs text-slate-400 mb-4">
              Peak power utilization across Bay Area sub-grids.
            </p>

            <div className="space-y-3">
              {viz.demand_by_region.map((reg) => (
                <div key={reg.region} className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{reg.region}</span>
                    <span className="font-mono text-cyan-400">{reg.demand_kw.toLocaleString()} kW</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${
                        reg.utilization >= 80
                          ? 'bg-rose-500'
                          : reg.utilization >= 60
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, reg.utilization)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                    <span>{reg.station_count} Hubs</span>
                    <span>{reg.utilization.toFixed(1)}% Capacity</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('station-map')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-cyan-300 border border-cyan-500/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore Interactive Geospatial Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visualization Grid Row 3: Station Utilization Comparison */}
      <div className="glass-card p-5 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Station Utilization & Capacity Stress</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live capacity utilization ranking across all 12 monitored charging hubs.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('stations')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View All Stations</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {viz.station_utilization.map((st) => (
            <div
              key={st.station_id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{st.station_id}</span>
                  <p className="font-bold text-xs text-white truncate max-w-[170px] group-hover:text-cyan-300 transition-colors">
                    {st.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{st.region}</p>
                </div>
                <AlertBadge level={st.risk_level} size="sm" />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-400">Peak Load:</span>
                  <span className="text-white font-bold">{st.peak_kw} / {st.capacity_kw} kW</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      st.utilization_percent >= 80
                        ? 'bg-rose-500'
                        : st.utilization_percent >= 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, st.utilization_percent)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
                  <span>Stress Ratio</span>
                  <span className="font-bold text-slate-200">{st.utilization_percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
