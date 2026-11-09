import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Zap,
  ShieldCheck,
  User as UserIcon,
  Download,
  Bot,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';

interface NavbarProps {
  currentRole: string;
  setCurrentRole: (role: string) => void;
  onOpenCopilot: () => void;
  onOpenReports: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  onOpenCopilot,
  onOpenReports,
}) => {
  const [time, setTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const roles = [
    { title: 'Grid Operator', desc: 'Substation load balancing & overload mitigation' },
    { title: 'Fleet Manager', desc: 'Depot overnight scheduling & cost arbitrage' },
    { title: 'Station Owner', desc: 'Asset utilization, uptime & retail tariffs' },
  ];

  const alerts = [
    { id: 1, title: 'Silicon Metro Hub nearing 88% capacity', type: 'warning', time: '5m ago' },
    { id: 2, title: 'Midday solar surplus window now active', type: 'info', time: '12m ago' },
    { id: 3, title: 'BESS battery peak shaving engaged at Airport Depot', type: 'success', time: '28m ago' },
  ];

  return (
    <header className="h-16 px-6 border-b border-white/5 bg-[#0a0f1d]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Live Grid Health Status Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase font-mono">
            Grid Live: 99.8% Stable
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="text-slate-500">SYS_TIME:</span>
          <span className="text-cyan-400 font-bold">{time}</span>
          <span className="text-slate-500">PST</span>
        </div>
      </div>

      {/* Right: Quick Actions, Role Switcher, Alerts & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Report Download Button */}
        <button
          onClick={onOpenReports}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-xs font-medium border border-white/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Report</span>
        </button>

        {/* Quick AI Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 hover:text-white text-xs font-semibold border border-cyan-500/30 hover:shadow-glow-cyan transition-all"
        >
          <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="hidden sm:inline">Ask Copilot</span>
        </button>

        {/* Alerts Notification Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative"
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-white/10 shadow-glass p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Active Alerts (3)</span>
                <span className="text-[10px] text-cyan-400 font-mono">Live Feeder</span>
              </div>
              <div className="mt-2 space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2 rounded-lg bg-slate-800/50 border border-white/5 text-xs">
                    <p className="font-medium text-slate-200">{a.title}</p>
                    <span className="text-[10px] text-slate-500">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs transition-all"
          >
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              {currentRole.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block font-semibold text-slate-100">{currentRole}</span>
              <span className="block text-[9px] text-cyan-400 uppercase font-mono">Active View</span>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-white/10 shadow-glass p-2 z-50">
              <p className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Switch Operational Persona
              </p>
              {roles.map((r) => (
                <button
                  key={r.title}
                  onClick={() => {
                    setCurrentRole(r.title);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                    currentRole === r.title
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      currentRole === r.title ? 'text-cyan-400' : 'text-slate-600'
                    }`}
                  />
                  <div>
                    <span className="font-semibold block">{r.title}</span>
                    <span className="text-[10px] text-slate-400 block">{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
