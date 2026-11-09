import React, { useState } from 'react';
import { HeatmapRow } from '../../types';

interface HeatmapChartProps {
  data: HeatmapRow[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; value: number } | null>(null);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate global min and max for relative intensity
  let minVal = 99999;
  let maxVal = 0;
  data.forEach((row) => {
    days.forEach((day) => {
      const v = row[day] || 0;
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    });
  });

  const getColorClass = (val: number) => {
    const ratio = (val - minVal) / Math.max(1, maxVal - minVal);
    if (ratio > 0.85) return 'bg-rose-500/80 hover:bg-rose-400 text-rose-100';
    if (ratio > 0.65) return 'bg-amber-500/70 hover:bg-amber-400 text-amber-100';
    if (ratio > 0.40) return 'bg-cyan-500/60 hover:bg-cyan-400 text-cyan-100';
    if (ratio > 0.20) return 'bg-emerald-500/50 hover:bg-emerald-400 text-emerald-100';
    return 'bg-slate-800/60 hover:bg-slate-700 text-slate-400';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Heatmap Legend */}
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Low Demand ({minVal.toFixed(0)} kW)</span>
            <div className="flex gap-1">
              <span className="w-3 h-3 rounded bg-slate-800/60" />
              <span className="w-3 h-3 rounded bg-emerald-500/50" />
              <span className="w-3 h-3 rounded bg-cyan-500/60" />
              <span className="w-3 h-3 rounded bg-amber-500/70" />
              <span className="w-3 h-3 rounded bg-rose-500/80" />
            </div>
            <span>Critical Peak ({maxVal.toFixed(0)} kW)</span>
          </div>
          {hoveredCell && (
            <div className="font-mono text-cyan-300">
              {hoveredCell.day} {hoveredCell.hour}: <span className="font-bold">{hoveredCell.value} kW</span>
            </div>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-8 gap-1.5 text-xs">
          {/* Day Header Row */}
          <div className="text-slate-500 font-mono text-[10px] uppercase text-right pr-2">Hour</div>
          {days.map((day) => (
            <div key={day} className="text-center font-bold text-slate-300 py-1 font-mono">
              {day}
            </div>
          ))}

          {/* 24 Hour Rows */}
          {data.map((row) => (
            <React.Fragment key={row.hour}>
              <div className="text-slate-500 font-mono text-[10px] flex items-center justify-end pr-2">
                {row.hour}
              </div>
              {days.map((day) => {
                const val = row[day] || 0;
                return (
                  <div
                    key={`${row.hour}-${day}`}
                    onMouseEnter={() => setHoveredCell({ day, hour: row.hour, value: val })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-7 rounded-md transition-all cursor-pointer flex items-center justify-center font-mono text-[10px] font-semibold ${getColorClass(
                      val
                    )}`}
                  >
                    {val > 2500 ? `${(val / 1000).toFixed(1)}k` : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
