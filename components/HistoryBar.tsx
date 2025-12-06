import React from 'react';
import { BlazeRoll } from '../types';

interface HistoryBarProps {
  history: BlazeRoll[];
}

const HistoryBar: React.FC<HistoryBarProps> = ({ history }) => {
  const displayHistory = history.slice(0, 15); // Show slightly fewer for mobile fit

  return (
    <div className="w-full glass-panel rounded-xl p-3 mb-4 border border-white/5">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Histórico Recente
        </h3>
        <span className="text-[10px] text-gray-500">Últimos 15</span>
      </div>
      
      <div className="flex justify-between items-center gap-1 overflow-hidden">
        {displayHistory.map((roll, index) => {
          let bgColor = 'bg-white';
          let textColor = 'text-gray-900';
          let borderColor = 'border-transparent';
          let shadow = '';

          if (roll.color === 'red') {
            bgColor = 'bg-gradient-to-br from-red-600 to-red-800';
            textColor = 'text-white';
            borderColor = 'border-red-500/50';
          } else if (roll.color === 'black') {
            bgColor = 'bg-gradient-to-br from-zinc-800 to-zinc-950';
            textColor = 'text-white';
            borderColor = 'border-zinc-600/50';
          } else {
             bgColor = 'bg-gradient-to-br from-white to-gray-200';
             textColor = 'text-black';
             shadow = 'shadow-[0_0_10px_rgba(255,255,255,0.5)]';
          }

          const isLatest = index === 0;

          return (
            <div
              key={roll.id}
              className={`
                relative flex items-center justify-center rounded-md font-bold text-xs
                w-8 h-8 sm:w-10 sm:h-10 border transition-all duration-300
                ${bgColor} ${textColor} ${borderColor} ${shadow}
                ${isLatest ? 'scale-110 z-10 ring-2 ring-white/50' : 'opacity-80 scale-95'}
              `}
            >
               {isLatest && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>}
               
              {roll.color === 'white' ? (
                <div className="w-3 h-3 rounded-full bg-black/80" />
              ) : (
                roll.roll
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryBar;