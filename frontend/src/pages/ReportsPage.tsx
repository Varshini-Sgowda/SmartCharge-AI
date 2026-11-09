import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';

export const ReportsPage: React.FC = () => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    setDownloadingFormat(format);
    let url = '';
    if (format === 'pdf') url = api.getPdfReportUrl();
    else if (format === 'excel') url = api.getExcelReportUrl();
    else if (format === 'csv') url = api.getCsvReportUrl();

    // Trigger native browser download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingFormat(null);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
            Feature 7 • Enterprise Analytics Export Engine
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            PDF • Excel • CSV
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Executive Energy & Demand Report Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Export publication-grade PDF briefings, formatted multi-sheet Excel workbooks, or raw CSV time series for stakeholders, regulatory compliance, and utility filings.
        </p>
      </div>

      {/* Export Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white">Executive PDF Briefing</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                ReportLab Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Comprehensive executive document formatted for C-suite and grid planners. Includes demand forecasts, model evaluation metrics, station risk tables, and decarbonization trends.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Executive Summary KPIs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Model Benchmarks (MAE, R²)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Station Overload Risk Roster
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Smart Charging Actions
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat === 'pdf'}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* Excel Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white">Multi-Sheet Excel Workbook</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                .XLSX Format
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Formatted multi-tab workbook generated with OpenPyXL. Includes separate worksheets for hourly demand series, station stress rankings, and ML model evaluation metrics.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sheet 1: 24h Hourly Forecast
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sheet 2: Station Capacity & Risks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sheet 3: ML Model Benchmarks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pre-formatted headers & borders
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat === 'excel'}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'excel' ? 'Exporting Excel...' : 'Download Excel (.xlsx)'}</span>
          </button>
        </div>

        {/* CSV Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-violet-500/40 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileCode className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white">Raw RFC 4180 CSV Data</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300">
                Machine-Readable
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Standard comma-separated time series feed ideal for ingestion into SCADA, energy management systems (EMS), pandas pipelines, or external analytics warehouses.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Hourly predicted demand (kW)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> 95% Confidence bounds (lower/upper)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> TOU tariff rates ($/kWh)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Marginal grid carbon intensity
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleDownload('csv')}
            disabled={downloadingFormat === 'csv'}
            className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs shadow-glow-violet flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'csv' ? 'Exporting CSV...' : 'Download CSV Dataset'}</span>
          </button>
        </div>
      </div>

      {/* Live Sample Preview Section */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Automated Report Content Coverage</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reports compile telemetry across all 7 modules dynamically at the time of export.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Certified Compliant</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-500 block text-[10px]">FORECAST ACCURACY</span>
            <span className="text-white font-bold">R² 0.9038 / MAE 291 kW</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-500 block text-[10px]">STATIONS COVERED</span>
            <span className="text-white font-bold">12 Regional Hubs</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-500 block text-[10px]">CARBON AUDIT</span>
            <span className="text-white font-bold">CAISO Marginal Factors</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-500 block text-[10px]">ECONOMIC AUDIT</span>
            <span className="text-white font-bold">TOU Peak Arbitrage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
