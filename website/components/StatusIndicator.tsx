import React from 'react';

interface Props {
  status: 'SAFE' | 'WARNING' | 'DANGER';
}

export const StatusIndicator: React.FC<Props> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'SAFE': return 'bg-green-500 text-white shadow-green-500/50';
      case 'WARNING': return 'bg-yellow-500 text-black shadow-yellow-500/50';
      case 'DANGER': return 'bg-red-500 text-white animate-pulse shadow-red-500/50';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg uppercase tracking-wider text-center ${getStyle()}`}>
      Status: {status}
    </div>
  );
};
