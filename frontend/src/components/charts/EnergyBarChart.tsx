import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { HourlyEnergyPoint } from '../../types';

interface EnergyBarChartProps {
  data: HourlyEnergyPoint[];
}

export const EnergyBarChart: React.FC<EnergyBarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" kWh" width={55} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as HourlyEnergyPoint;
                return (
                  <div className="rounded-xl bg-slate-900 border border-white/10 p-3 shadow-glass text-xs font-mono">
                    <p className="font-bold text-white mb-1">Time: {label}</p>
                    <p className="text-cyan-400">Energy: {item.energy_kwh.toLocaleString()} kWh</p>
                    <p className="text-amber-400">Tariff: ${item.tariff_rate.toFixed(2)}/kWh</p>
                    <p className="text-emerald-400 pt-1 border-t border-white/5 font-bold">
                      Est Cost: ${item.cost_usd.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="energy_kwh" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              // Color bar according to tariff
              const color =
                entry.tariff_rate >= 0.4
                  ? '#f43f5e' // Peak (Rose)
                  : entry.tariff_rate <= 0.15
                  ? '#10b981' // Off-peak (Emerald)
                  : '#06b6d4'; // Mid-peak (Cyan)
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
