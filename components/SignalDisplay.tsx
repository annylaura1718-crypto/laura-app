import React from 'react';
import { SignalState } from '../types';
import { Loader2, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';

interface SignalDisplayProps {
  signal: SignalState;
}

const SignalDisplay: React.FC<SignalDisplayProps> = ({ signal }) => {
  // Styles for different states
  const getContainerStyle = () => {
    switch (signal.status) {
      case 'bet': return 'border-red-500/50 bg-gradient-to-b from-red-950/40 to-black shadow-[0_0_30px_rgba(220,38,38,0.2)]';
      case 'win': return 'border-green-500/50 bg-gradient-to-b from-green-950/40 to-black shadow-[0_0_30px_rgba(34,197,94,0.2)]';
      case 'loss': return 'border-red-600 bg-red-950/20';
      default: return 'border-white/10 bg-black/40';
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto rounded-xl border transition-all duration-500 relative overflow-hidden group ${getContainerStyle()}`}>
      
      {/* HUD Lines Decoration */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50"></div>
      
      <div className="p-5 flex flex-col items-center justify-center min-h-[180px]">
        
        {/* ANALYZING STATE */}
        {signal.status === 'analyzing' && (
          <div className="flex flex-col items-center space-y-3 animate-pulse">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
              <Loader2 className="w-10 h-10 text-red-500 animate-spin relative z-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-tech font-bold text-white tracking-widest">RASTREANDO</h2>
              <p className="text-xs text-red-400 font-mono mt-1 border-t border-red-900/50 pt-1">
                {signal.message}
              </p>
            </div>
          </div>
        )}

        {/* BET STATE - COMPACT & IMPACTFUL */}
        {signal.status === 'bet' && signal.predictedColor && (
          <div className="w-full relative z-10">
            <div className="absolute -top-2 -right-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 tracking-widest font-bold">Entrada Confirmada</span>
                <span className="text-xs text-white font-mono">{new Date(signal.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="bg-red-600/20 border border-red-500/50 px-2 py-1 rounded text-[10px] text-red-300 font-bold uppercase tracking-wider animate-pulse">
                Sem Gale
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-4">
               <div className="text-right">
                  <p className="text-sm text-gray-400 uppercase">Apostar</p>
                  <h3 className={`text-3xl font-tech font-black ${signal.predictedColor === 'red' ? 'text-red-500 neon-text-red' : 'text-white neon-text'}`}>
                    {signal.predictedColor === 'red' ? 'VERMELHO' : 'PRETO'}
                  </h3>
               </div>
               
               <div className={`w-14 h-14 rounded-lg shadow-lg border-2 flex items-center justify-center ${
                 signal.predictedColor === 'red' 
                 ? 'bg-red-600 border-red-400 shadow-red-600/40' 
                 : 'bg-zinc-900 border-gray-500 shadow-white/10'
               }`}>
                 <div className={`w-8 h-8 rounded-full border-2 ${
                   signal.predictedColor === 'red' ? 'bg-white border-red-200' : 'bg-zinc-800 border-gray-600'
                 }`}></div>
               </div>
            </div>

            <div className="bg-black/40 rounded-lg p-2 border border-white/5 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Proteger no Branco</span>
            </div>
          </div>
        )}

        {/* WIN STATE */}
        {signal.status === 'win' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
               <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-4xl font-tech font-black text-green-400 tracking-tighter drop-shadow-lg">WIN SG</h2>
            <p className="text-green-200 text-xs font-bold uppercase tracking-widest mt-1">Lucro Confirmado</p>
          </div>
        )}

        {/* LOSS STATE */}
        {signal.status === 'loss' && (
          <div className="flex flex-col items-center animate-in shake duration-300">
             <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
               <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-3xl font-tech font-black text-red-500 tracking-tighter">LOSS</h2>
            <p className="text-red-300 text-xs font-bold uppercase tracking-widest mt-1">Aguarde Próximo Sinal</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalDisplay;