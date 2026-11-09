import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-8 bg-slate-800/60 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/40 rounded-xl border border-white/5"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-800/40 rounded-xl border border-white/5"></div>
        ))}
      </div>
    </div>
  );
};
