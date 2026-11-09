import React from 'react';

interface UtilizationGaugeProps {
  value: number; // 0 to 100
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UtilizationGauge: React.FC<UtilizationGaugeProps> = ({
  value,
  title,
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const getColor = (v: number) => {
    if (v >= 85) return { stroke: '#f43f5e', text: 'text-rose-400', label: 'Critical' };
    if (v >= 70) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'High' };
    if (v >= 40) return { stroke: '#06b6d4', text: 'text-cyan-400', label: 'Optimal' };
    return { stroke: '#10b981', text: 'text-emerald-400', label: 'Underutilized' };
  };

  const status = getColor(clamped);

  const radius = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;
  const strokeWidth = size === 'sm' ? 5 : size === 'lg' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={status.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-bold ${size === 'lg' ? 'text-lg' : 'text-xs'} ${status.text}`}>
            {clamped.toFixed(0)}%
          </span>
        </div>
      </div>
      {title && (
        <div>
          <p className="text-xs font-semibold text-white">{title}</p>
          <p className={`text-[10px] font-mono font-medium ${status.text}`}>{status.label}</p>
        </div>
      )}
    </div>
  );
};
