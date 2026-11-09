import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Cpu,
  Sliders,
  Zap,
  Truck,
  Bot,
  Leaf,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Layers,
  Sparkles,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const navSections = [
    {
      title: 'Navigation',
      items: [
        { id: 'landing', label: 'Home / Showcase', icon: Home, badge: 'Intro' },
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp, badge: 'AI' },
        { id: 'station-map', label: 'Station Geospatial Map', icon: MapPin },
        { id: 'stations', label: 'Station Intelligence', icon: Layers },
      ],
    },
    {
      title: 'Advanced AI & Optimization',
      items: [
        { id: 'digital-twin', label: 'Digital Twin Simulator', icon: Cpu, badge: 'Interactive' },
        { id: 'scenarios', label: 'What-If Scenario Lab', icon: Sliders },
        { id: 'optimizer', label: 'Smart Charging Optimizer', icon: Zap },
        { id: 'fleet', label: 'Fleet Scheduler', icon: Truck },
        { id: 'copilot', label: 'AI Energy Copilot', icon: Bot, badge: 'Ask AI' },
      ],
    },
    {
      title: 'Sustainability & Insights',
      items: [
        { id: 'carbon', label: 'Carbon Intelligence', icon: Leaf },
        { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet, badge: 'PDF' },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-white/5 bg-[#0a0f1d]/95 backdrop-blur-xl flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Logo & Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-black shadow-glow-cyan">
              <Zap className="w-5 h-5 fill-current" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  SmartCharge <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">AI</span>
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Energy Intelligence
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-cyan-400/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && isActive && (
                      <span className="absolute right-1 w-1.5 h-6 bg-cyan-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Pulse Status Widget */}
      <div className="p-3 border-t border-white/5">
        <div
          className={`p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">Grid Active</span>
                <span className="text-[9px] font-mono text-emerald-400">99.8% STABLE</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">12 Hubs Synchronized</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
