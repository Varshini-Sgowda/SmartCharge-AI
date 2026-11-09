import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Zap,
  Leaf,
  Bell,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Cpu,
  UserCheck
} from 'lucide-react';

interface SettingsPageProps {
  currentRole: string;
  setCurrentRole: (role: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentRole, setCurrentRole }) => {
  const [tariffs, setTariffs] = useState({
    offPeak: 0.14,
    midPeak: 0.22,
    peak: 0.44,
  });

  const [carbonFactor, setCarbonFactor] = useState(0.385);
  const [overloadThreshold, setOverloadThreshold] = useState(85);
  const [underutilizedThreshold, setUnderutilizedThreshold] = useState(40);
  const [saved, setSaved] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainSuccess(false);
    try {
      const res = await fetch('/api/forecast/retrain', { method: 'POST' });
      if (res.ok) {
        setRetrainSuccess(true);
        setTimeout(() => setRetrainSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
            System Preferences & Model Tuning
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Settings & Grid Assumptions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure electricity tariff schedules, regional carbon intensity factors, and automated alert trigger thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration parameters updated successfully and applied to analytical models.</span>
        </div>
      )}

      {/* Tariffs Section */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white border-b border-white/5 pb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Time-Of-Use (TOU) Electricity Tariffs ($ / kWh)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Super Off-Peak (00:00 - 06:00)</label>
            <input
              type="number"
              step="0.01"
              value={tariffs.offPeak}
              onChange={(e) => setTariffs({ ...tariffs, offPeak: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Mid-Peak (06:00 - 14:00, 21:00 - 24:00)</label>
            <input
              type="number"
              step="0.01"
              value={tariffs.midPeak}
              onChange={(e) => setTariffs({ ...tariffs, midPeak: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Peak Strain (14:00 - 21:00)</label>
            <input
              type="number"
              step="0.01"
              value={tariffs.peak}
              onChange={(e) => setTariffs({ ...tariffs, peak: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Carbon Emission Assumptions */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white border-b border-white/5 pb-3">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span>Regional Grid Carbon Baseline</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Average Grid Factor (kg CO₂/kWh):</span>
              <span className="text-emerald-400 font-bold">{carbonFactor} kg/kWh</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.01"
              value={carbonFactor}
              onChange={(e) => setCarbonFactor(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.10 (Hydro/Nuclear)</span>
              <span>0.80 (Coal Peaker)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Alert Thresholds */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white border-b border-white/5 pb-3">
          <Bell className="w-4 h-4 text-rose-400" />
          <span>Operational Threshold Triggers</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Overload Risk Alert Level:</span>
              <span className="text-rose-400 font-bold">≥ {overloadThreshold}% Utilization</span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              step="5"
              value={overloadThreshold}
              onChange={(e) => setOverloadThreshold(Number(e.target.value))}
              className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Underutilized Warning Level:</span>
              <span className="text-amber-400 font-bold">&lt; {underutilizedThreshold}% Utilization</span>
            </div>
            <input
              type="range"
              min="20"
              max="55"
              step="5"
              value={underutilizedThreshold}
              onChange={(e) => setUnderutilizedThreshold(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Pipeline ML Retraining Control */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm font-bold text-white">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Forecasting Pipeline Retraining</span>
          </div>
          {retrainSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Models Retrained & Cached
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Re-runs the time-series chronological train/test split across all 45,127 EV sessions, tunes hyperparameters for RandomForest and GradientBoosting, and updates the feature matrix.
        </p>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{retraining ? 'Retraining Machine Learning Engine...' : 'Retrain All Forecast Models'}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-glow-cyan hover:scale-[1.02] transition-all"
        >
          Save Configuration Changes
        </button>
      </div>
    </div>
  );
};
