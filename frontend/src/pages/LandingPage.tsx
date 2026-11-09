import React from 'react';
import {
  Zap,
  TrendingUp,
  Cpu,
  Sliders,
  ShieldCheck,
  Bot,
  Leaf,
  ArrowRight,
  Database,
  BarChart3,
  Server,
  Layers,
  Sparkles,
  ChevronRight,
  Code2
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <header className="border-b border-white/5 bg-[#0a0f1d]/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-black text-slate-950 shadow-glow-cyan">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                SmartCharge <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Energy Intelligence Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#digital-twin" className="hover:text-cyan-400 transition-colors">Digital Twin</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#metrics" className="hover:text-cyan-400 transition-colors">ML Benchmarks</a>
          </nav>

          <button
            onClick={onEnterApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-glow-cyan hover:opacity-95 hover:scale-[1.02] transition-all"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Glow backdrop spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Next-Gen EV Energy Infrastructure Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Predict EV Grid Surges.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400">
              Optimize Capacity.
            </span>{' '}
            Eliminate Bottlenecks.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            SmartCharge AI unites empirical time-series machine learning, physics-informed queuing digital twins, and tariff arbitrage algorithms to empower energy operators, commercial fleet depots, and charging networks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-base shadow-glow-cyan hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Enter Command Center</span>
            </button>
            <a
              href="#architecture"
              className="flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-200 text-base font-semibold transition-all hover:bg-slate-800/80"
            >
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>View System Architecture</span>
            </a>
          </div>

          {/* Real-world KPI Ticker Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl glass-card border border-white/10">
            <div className="p-3 text-center border-r border-white/5">
              <p className="text-3xl font-extrabold text-white font-mono">0.9038</p>
              <p className="text-xs uppercase font-medium text-cyan-400 mt-1">RandomForest R² Score</p>
            </div>
            <div className="p-3 text-center border-r border-white/5">
              <p className="text-3xl font-extrabold text-white font-mono">45,127</p>
              <p className="text-xs uppercase font-medium text-emerald-400 mt-1">Modeled EV Sessions</p>
            </div>
            <div className="p-3 text-center border-r border-white/5">
              <p className="text-3xl font-extrabold text-white font-mono">68.2%</p>
              <p className="text-xs uppercase font-medium text-amber-400 mt-1">Max Tariff Cost Savings</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-3xl font-extrabold text-white font-mono">37.3k kg</p>
              <p className="text-xs uppercase font-medium text-violet-400 mt-1">Net CO₂ Avoided Today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-[#0a0f1d]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-2">Platform Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Six Enterprise Pillars of EV Energy Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card-interactive p-7 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Demand Forecasting Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Trained on chronological EV charging time series. Compares Random Forest, Gradient Boosting, and Ridge models with 95% confidence bands and explainable feature importances.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card-interactive p-7 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">EV Digital Twin Simulator</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Physics-inspired M/M/c queuing simulator modeling fleet arrivals, charger power limits, driver queue delays, and BESS (battery storage) peak shaving arbitrage in real time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card-interactive p-7 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-5">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">What-If Scenario Lab</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stress-test grid feeders under +50% EV adoption waves, extreme cold freeze events, summer heat chiller spikes, and dynamic tariff restructurings against actual baseline forecasts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card-interactive p-7 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tariff-Aware Smart Optimizer</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Evaluates Time-Of-Use electricity tiers to identify the most economical charging windows ($0.14 vs $0.44/kWh), cleanest renewable solar hours, and spatial load rebalancing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card-interactive p-7 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Constrained Fleet Scheduler</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Earliest Deadline First (EDF) algorithm for commercial EV fleets (Rivian, Ford, Tesla). Caps peak power beneath depot feeder limits while guaranteeing 100% departure deadlines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card-interactive p-7 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Autonomous Copilot</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive domain analytics copilot. Delivers conversational, evidence-based answers to operational questions using live ML predictions, station metrics, and scenario calculations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack & Architecture Section */}
      <section id="architecture" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-mono tracking-widest text-emerald-400 mb-2">Engineering Rigor</h2>
            <p className="text-3xl font-extrabold text-white">Full-Stack Production-Ready Architecture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-cyan-400 font-bold">
                <Server className="w-5 h-5" />
                <span>Backend Core</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li>• Python 3.14 + FastAPI</li>
                <li>• Pydantic v2 validation</li>
                <li>• SQLAlchemy ORM (SQLite / PostgreSQL)</li>
                <li>• RESTful API with Swagger docs</li>
                <li>• JWT authentication & PBKDF2 hashing</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-emerald-400 font-bold">
                <Database className="w-5 h-5" />
                <span>Machine Learning & Analytics</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li>• Scikit-learn (RandomForest, GradientBoosting)</li>
                <li>• Cyclical temporal feature engineering</li>
                <li>• Autoregressive lag & rolling window models</li>
                <li>• ReportLab PDF report generation</li>
                <li>• OpenPyXL multi-sheet Excel generator</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-violet-400 font-bold">
                <Layers className="w-5 h-5" />
                <span>Frontend Experience</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li>• React 18 + TypeScript + Vite</li>
                <li>• Tailwind CSS glassmorphic design</li>
                <li>• Recharts interactive data viz</li>
                <li>• Leaflet OpenStreetMap geospatial engine</li>
                <li>• Lucide icons & Framer Motion polish</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-[#0a0f1d] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">SmartCharge AI</span>
            <span>— Intelligent EV Charging Demand Forecasting Platform</span>
          </div>
          <p>© 2026 SmartCharge AI. Built for Software Engineering Portfolio & Energy Grid Modernization.</p>
        </div>
      </footer>
    </div>
  );
};
