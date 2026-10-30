import React from 'react';

interface Props {
  onTestAlarm?: () => void;
  onReset?: () => void;
}

export const Controls: React.FC<Props> = ({ onTestAlarm, onReset }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <h3 className="text-slate-200 font-bold text-lg mb-4">System Controls</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onTestAlarm}
          className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
        >
          <span>Test Alarm</span>
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition border border-slate-700 flex items-center justify-center space-x-2"
        >
          <span>System Reset</span>
        </button>
      </div>
    </div>
  );
};
