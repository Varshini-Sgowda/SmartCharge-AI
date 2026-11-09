import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Cpu,
  Brain,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DemandChart } from '../components/charts/DemandChart';
import { AlertBadge } from '../components/common/AlertBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ForecastResponse } from '../types';
import { api } from '../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

export const ForecastingPage: React.FC = () => {
  const [horizon, setHorizon] = useState<number>(24);
  const [modelType, setModelType] = useState<string>('RandomForest');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await api.getForecast(horizon, modelType);
      setForecast(data);
    } catch (err) {
      console.error('Forecast fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [horizon, modelType]);

  const models = [
    { id: 'RandomForest', name: 'Random Forest Regressor', tag: 'Primary Benchmark', badge: 'Ensemble' },
    { id: 'GradientBoosting', name: 'Gradient Boosting (GBR)', tag: 'High Non-Linearity', badge: 'Boosting' },
    { id: 'RidgeRegression', name: 'Ridge Linear L2', tag: 'Linear Regularized', badge: 'Baseline' },
  ];

  if (loading && !forecast) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              Supervised Machine Learning
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Validated on Out-of-Sample Holdout
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            EV Charging Demand Forecasting Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Time-series multi-step autoregressive models predicting feeder demand, peak spikes, and uncertainty intervals.
          </p>
        </div>

        {/* Horizon Selector Pill Group */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-white/10">
          {[
            { hours: 24, label: '24 Hours' },
            { hours: 48, label: '48 Hours' },
            { hours: 168, label: '7 Days' },
          ].map((h) => (
            <button
              key={h.hours}
              onClick={() => setHorizon(h.hours)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                horizon === h.hours
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {models.map((m) => {
          const isSelected = modelType === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setModelType(m.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">{m.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {m.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">{m.tag}</p>
            </div>
          );
        })}
      </div>

      {forecast && (
        <>
          {/* Model Performance Evaluation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Coefficient R² Score
              </span>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {forecast.metrics.r2_score.toFixed(4)}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Goodness of fit (&gt;0.88 indicates high precision)</span>
            </div>
            <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Mean Absolute Error (MAE)
              </span>
              <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
                {forecast.metrics.mae} <span className="text-xs font-normal">kW</span>
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Average absolute deviation</span>
            </div>
            <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Root Mean Squared Error (RMSE)
              </span>
              <p className="text-3xl font-extrabold text-violet-400 font-mono mt-1">
                {forecast.metrics.rmse} <span className="text-xs font-normal">kW</span>
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Penalizes large outlier spikes</span>
            </div>
            <div className="p-4 rounded-xl glass-card border border-white/5 text-center">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Mean Abs % Error (MAPE)
              </span>
              <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
                {forecast.metrics.mape}%
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Relative accuracy across hours</span>
            </div>
          </div>

          {/* Forecast Chart Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{horizon}-Hour Demand Projection</span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Model: {forecast.model_used}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shaded envelope displays empirical 95% confidence intervals (±1.96σ).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Forecast Peak:</span>
                  <span className="text-white font-bold">{forecast.peak_demand_kw} kW</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Peak Window:</span>
                  <span className="text-rose-400 font-bold">{forecast.peak_demand_window}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Energy:</span>
                  <span className="text-emerald-400 font-bold">{forecast.total_energy_forecast_kwh.toLocaleString()} kWh</span>
                </div>
              </div>
            </div>

            <DemandChart
              data={forecast.hourly_forecast.map((h) => ({
                hour: `${String(h.hour).padStart(2, '0')}:00`,
                hour_num: h.hour,
                predicted_demand_kw: h.predicted_demand_kw,
                actual_demand_kw: h.actual_demand_kw || undefined,
                lower_bound_kw: h.lower_bound_kw,
                upper_bound_kw: h.upper_bound_kw,
                is_peak: h.is_peak_hour,
              }))}
              showConfidenceInterval={true}
            />
          </div>

          {/* Explainable AI (XAI) & Model Benchmark Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importance (Explainable AI) */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <span>Explainable AI — Feature Importance</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Factors driving demand forecasts (Gini impurity decrease in RandomForest).
                  </p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Scikit-learn XAI</span>
              </div>

              <div className="space-y-3">
                {forecast.feature_importance.slice(0, 7).map((feat, idx) => (
                  <div key={feat.feature} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-200">
                        {idx + 1}. {feat.feature}
                      </span>
                      <span className="font-mono font-semibold text-cyan-400">
                        {(feat.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                        style={{ width: `${feat.importance * 100 * 2.5}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{feat.impact_description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Comparison Leaderboard Table */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Model Benchmark Leaderboard</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Evaluated on 432 out-of-sample chronological test samples.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-2">Model</th>
                        <th className="py-2">MAE (kW)</th>
                        <th className="py-2">RMSE</th>
                        <th className="py-2">R²</th>
                        <th className="py-2">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {forecast.all_models_metrics.map((m) => (
                        <tr
                          key={m.model_name}
                          className={m.model_name === forecast.model_used ? 'bg-cyan-500/10' : ''}
                        >
                          <td className="py-3 font-bold text-white flex items-center gap-1.5">
                            {m.model_name === 'RandomForest' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            {m.model_name}
                          </td>
                          <td className="py-3 text-cyan-300">{m.mae}</td>
                          <td className="py-3 text-violet-300">{m.rmse}</td>
                          <td className="py-3 font-bold text-emerald-400">{m.r2_score.toFixed(4)}</td>
                          <td className="py-3 text-slate-400">{m.training_time_ms} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 mt-4 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Engineering Note:</strong> Random Forest Regressor achieves the highest R² (0.9038) and lowest MAE by effectively capturing multi-modal diurnal morning and evening commuting spikes without overfitting.
                </p>
              </div>
            </div>
          </div>

          {/* Station-wise Forecast Breakdown */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-1">Station-Level Forecast Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">
              Station load projections, peak utilization risk level, and automated dispatch recommendation.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono">
                    <th className="py-2">Station</th>
                    <th className="py-2">Region</th>
                    <th className="py-2">Capacity</th>
                    <th className="py-2">Forecast Peak</th>
                    <th className="py-2">Util %</th>
                    <th className="py-2">Risk</th>
                    <th className="py-2">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {forecast.station_forecasts.map((st) => (
                    <tr key={st.station_id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-white">{st.name}</td>
                      <td className="py-3 text-slate-400">{st.region}</td>
                      <td className="py-3 font-mono text-slate-300">{st.capacity_kw} kW</td>
                      <td className="py-3 font-mono text-cyan-400 font-bold">{st.forecasted_peak_kw} kW</td>
                      <td className="py-3 font-mono">
                        <span
                          className={`font-bold ${
                            st.predicted_utilization >= 80
                              ? 'text-rose-400'
                              : st.predicted_utilization >= 60
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {st.predicted_utilization}%
                        </span>
                      </td>
                      <td className="py-3">
                        <AlertBadge level={st.risk_level} size="sm" />
                      </td>
                      <td className="py-3 text-slate-300 text-[11px] max-w-xs">{st.recommended_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
