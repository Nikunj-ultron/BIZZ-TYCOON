import React from 'react';

interface Reading {
  timestamp: string;
  ppm: number;
}

interface Props {
  history: Reading[];
}

export const HistoryGraph: React.FC<Props> = ({ history }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 font-bold text-lg">Gas Concentration Trend (PPM)</h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Live SQLite Log</span>
      </div>
      <div className="h-48 flex items-end space-x-1 border-b border-l border-slate-700 p-2">
        {history.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            Waiting for telemetry data...
          </div>
        ) : (
          history.slice(-20).map((item, idx) => {
            const heightPct = Math.min(100, Math.max(10, (item.ppm / 1000) * 100));
            const color = item.ppm >= 500 ? 'bg-red-500' : item.ppm >= 200 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${color}`}
                  style={{ height: `${heightPct}%` }}
                />
                <div className="absolute -top-8 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                  {item.ppm} PPM
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
