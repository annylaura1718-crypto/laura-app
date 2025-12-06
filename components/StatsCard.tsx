import React from 'react';
import { Stats } from '../types';
import { Trophy, Ban, Zap } from 'lucide-react';

interface StatsCardProps {
  stats: Stats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full mb-6">
      
      {/* Wins */}
      <div className="glass-panel p-3 rounded-xl flex flex-col items-center border border-green-500/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
        <div className="flex items-center text-green-400 mb-1 z-10">
          <Trophy size={14} className="mr-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Wins</span>
        </div>
        <span className="text-xl font-tech font-bold text-white z-10">{stats.wins}</span>
      </div>

      {/* Assertiveness (Center Highlight) */}
       <div className="glass-panel p-3 rounded-xl flex flex-col items-center border border-white/10 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="flex items-center text-white mb-1 z-10">
          <Zap size={14} className="mr-1 text-yellow-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Assert</span>
        </div>
        <span className={`text-xl font-tech font-bold z-10 ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.winRate}%
        </span>
      </div>

      {/* Losses */}
      <div className="glass-panel p-3 rounded-xl flex flex-col items-center border border-red-500/20 relative overflow-hidden group">
         <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
        <div className="flex items-center text-red-400 mb-1 z-10">
          <Ban size={14} className="mr-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Loss</span>
        </div>
        <span className="text-xl font-tech font-bold text-white z-10">{stats.losses}</span>
      </div>

    </div>
  );
};

export default StatsCard;