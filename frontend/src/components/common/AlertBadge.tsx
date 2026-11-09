import React from 'react';

interface AlertBadgeProps {
  level: 'Low' | 'Moderate' | 'High' | 'Critical' | string;
  size?: 'sm' | 'md';
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ level, size = 'md' }) => {
  const normalized = level.toLowerCase();

  const styles = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    moderate: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
  }[normalized] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  const dotColor = {
    low: 'bg-emerald-400',
    moderate: 'bg-cyan-400',
    high: 'bg-amber-400',
    critical: 'bg-rose-400',
  }[normalized] || 'bg-slate-400';

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {level}
    </span>
  );
};
