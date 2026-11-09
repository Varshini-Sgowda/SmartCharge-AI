import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ActualVsPredictedPoint } from '../../types';

interface DemandChartProps {
  data: ActualVsPredictedPoint[];
  showConfidenceInterval?: boolean;
}

export const DemandChart: React.FC<DemandChartProps> = ({
  data,
  showConfidenceInterval = true,
}) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="hour"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tick={{ fill: '#94a3b8' }}
            unit=" kW"
            width={60}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ActualVsPredictedPoint;
                return (
                  <div className="rounded-xl bg-slate-900/95 border border-white/10 p-3 shadow-glass text-xs">
                    <p className="font-bold text-white mb-1.5 flex items-center justify-between">
                      <span>Time: {label}</span>
                      {item.is_peak && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono">
                          PEAK STRAIN
                        </span>
                      )}
                    </p>
                    <div className="space-y-1">
                      <p className="text-cyan-400 font-mono flex items-center justify-between gap-4">
                        <span>Predicted Demand:</span>
                        <span className="font-bold">{item.predicted_demand_kw} kW</span>
                      </p>
                      {item.actual_demand_kw !== undefined && (
                        <p className="text-emerald-400 font-mono flex items-center justify-between gap-4">
                          <span>Historical Actual:</span>
                          <span className="font-bold">{item.actual_demand_kw} kW</span>
                        </p>
                      )}
                      <p className="text-violet-400 font-mono text-[10px] flex items-center justify-between gap-4 pt-1 border-t border-white/5">
                        <span>95% Confidence Band:</span>
                        <span>{item.lower_bound_kw} – {item.upper_bound_kw} kW</span>
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
          />

          {showConfidenceInterval && (
            <Area
              type="monotone"
              dataKey="upper_bound_kw"
              stroke="none"
              fill="url(#confidenceGrad)"
              name="95% Confidence Range"
            />
          )}

          <Area
            type="monotone"
            dataKey="predicted_demand_kw"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#predictedGrad)"
            name="ML Predicted Demand (kW)"
          />

          <Line
            type="monotone"
            dataKey="actual_demand_kw"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 2, fill: '#10b981' }}
            name="Actual Load (kW)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
