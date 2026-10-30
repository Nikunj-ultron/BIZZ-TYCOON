import React from 'react';

interface Props {
  digit: number;
}

export const SevenSegment: React.FC<Props> = ({ digit }) => {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
      <span className="text-xs text-slate-400 mb-2 uppercase tracking-wide">7-Segment Readout</span>
      <div className="text-4xl font-mono font-bold text-red-500 tracking-widest bg-black px-4 py-2 rounded-lg border border-red-900">
        {String(digit).padStart(4, '0')}
      </div>
    </div>
  );
};
