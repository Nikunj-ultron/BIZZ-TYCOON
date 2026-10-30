import React from 'react';

interface Props {
  ldr: number;
  motion: boolean;
  touch: boolean;
  battery: number;
}

export const Diagnostics: React.FC<Props> = ({ ldr, motion, touch, battery }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <h3 className="text-slate-200 font-bold text-lg mb-4">Hardware Diagnostics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col">
          <span className="text-xs text-slate-400 uppercase">LDR Light Level</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1">{ldr} <span className="text-xs text-slate-400">lux</span></span>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col">
          <span className="text-xs text-slate-400 uppercase">Battery Health</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1">{battery}%</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col">
          <span className="text-xs text-slate-400 uppercase">PIR Motion</span>
          <span className={`text-lg font-bold mt-1 ${motion ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
            {motion ? 'Detected' : 'Clear'}
          </span>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col">
          <span className="text-xs text-slate-400 uppercase">Touch Sensor</span>
          <span className={`text-lg font-bold mt-1 ${touch ? 'text-yellow-400' : 'text-slate-300'}`}>
            {touch ? 'Touched' : 'Normal'}
          </span>
        </div>
      </div>
    </div>
  );
};
