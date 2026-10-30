import React from 'react';

interface Props {
  label: string;
  value: string | number;
  unit: string;
  color?: string;
}

export const Display: React.FC<Props> = ({ label, value, unit, color = 'text-white' }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
      <span className="text-slate-400 text-sm uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-baseline space-x-2">
        <span className={`text-5xl font-extrabold ${color}`}>{value}</span>
        <span className="text-slate-400 text-lg font-medium">{unit}</span>
      </div>
    </div>
  );
};
