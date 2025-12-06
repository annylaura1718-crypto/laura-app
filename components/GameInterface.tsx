import React, { useState, useEffect, useRef } from 'react';
import { fetchBlazeHistory } from '../services/api';
import { authService } from '../services/auth';
import { BlazeRoll, SignalState, Stats } from '../types';
import HistoryBar from './HistoryBar';
import SignalDisplay from './SignalDisplay';
import StatsCard from './StatsCard';
import { RefreshCw, Radio, Flame, LogOut, Shield } from 'lucide-react';

interface ExtendedSignalState extends SignalState {
  targetRollId?: string;
}

const INITIAL_STATS: Stats = {
  wins: 0,
  losses: 0,
  total: 0,
  winRate: 0,
  assertiveness: "0%"
};

interface GameInterfaceProps {
    onLogout: () => void;
    userId: string;
    userEmail: string;
    isAdmin?: boolean;
    onAdminAccess?: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ onLogout, userId, userEmail, isAdmin, onAdminAccess }) => {
  const [history, setHistory] = useState<BlazeRoll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  
  const [signal, setSignal] = useState<ExtendedSignalState>({
    status: 'analyzing',
    predictedColor: null,
    message: 'INICIANDO SG LAURA...',
    timestamp: Date.now()
  });
  
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  
  const lastProcessedApiId = useRef<string | null>(null);
  const processingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analyzePattern = (currentHistory: BlazeRoll[]): ExtendedSignalState => {
    if (currentHistory.length < 5) return { ...signal, status: 'analyzing', message: 'LENDO DADOS...' };

    const lastRoll = currentHistory[0];
    const targetNumber = lastRoll.roll;

    if (lastRoll.color === 'white') {
        return { 
          status: 'analyzing', 
          predictedColor: null, 
          message: 'BRANCO - RECALCULANDO', 
          timestamp: Date.now() 
        };
    }
    
    let redNextCount = 0;
    let blackNextCount = 0;
    let occurrences = 0;

    for (let i = 1; i < currentHistory.length - 1; i++) {
      if (occurrences >= 5) break;

      if (currentHistory[i].roll === targetNumber) {
        const resultAfterThat = currentHistory[i - 1]; 
        
        if (resultAfterThat) {
            if (resultAfterThat.color === 'red') redNextCount++;
            if (resultAfterThat.color === 'black') blackNextCount++;
            occurrences++;
        }
      }
    }

    if (occurrences === 0) {
       const lastColor = lastRoll.color;
       return {
          status: 'bet',
          predictedColor: lastColor === 'red' ? 'black' : 'red',
          message: 'PADRÃO DE INVERSÃO',
          timestamp: Date.now(),
          targetRollId: 'WAITING_NEXT'
       };
    }

    if (redNextCount > blackNextCount) {
        return {
          status: 'bet',
          predictedColor: 'red',
          message: 'PADRÃO IDENTIFICADO',
          timestamp: Date.now(),
          targetRollId: 'WAITING_NEXT'
        };
    } else if (blackNextCount > redNextCount) {
        return {
          status: 'bet',
          predictedColor: 'black',
          message: 'PADRÃO IDENTIFICADO',
          timestamp: Date.now(),
          targetRollId: 'WAITING_NEXT'
        };
    } else {
        return {
           status: 'bet',
           predictedColor: lastRoll.color === 'red' ? 'red' : 'black',
           message: 'ALTA PROBABILIDADE',
           timestamp: Date.now(),
           targetRollId: 'WAITING_NEXT'
        };
    }
  };

  const updateData = async () => {
    try {
      const data = await fetchBlazeHistory();
      
      if (!data || data.length === 0) {
        setConnectionError(true);
        return;
      }

      setConnectionError(false);
      setHistory(data);
      setLoading(false);

      const latestApiRoll = data[0];

      if (!lastProcessedApiId.current) {
        lastProcessedApiId.current = latestApiRoll.id;
        setSignal(analyzePattern(data));
        return;
      }

      if (latestApiRoll.id === lastProcessedApiId.current) {
        return;
      }

      console.log("Novo giro detectado:", latestApiRoll.id, latestApiRoll.color);
      lastProcessedApiId.current = latestApiRoll.id;

      if (signal.status === 'bet') {
        const isWin = latestApiRoll.color === signal.predictedColor || latestApiRoll.color === 'white';
        
        // SALVA ESTATISTICA NO DB DO USUARIO (OU ADMIN)
        authService.recordGameResult(userId, isWin ? 'win' : 'loss');

        if (isWin) {
            setSignal(prev => ({ 
                ...prev, 
                status: 'win', 
                message: 'GREEN! LUCRO NO BOLSO',
                timestamp: Date.now() 
            }));
            
            setStats(prev => {
                const w = prev.wins + 1;
                const t = prev.total + 1;
                return { ...prev, wins: w, total: t, winRate: Math.round((w/t)*100) };
            });
        } else {
            setSignal(prev => ({ 
                ...prev, 
                status: 'loss', 
                message: 'LOSS - RECUPERA EM BREVE',
                timestamp: Date.now() 
            }));
             setStats(prev => {
                const l = prev.losses + 1;
                const t = prev.total + 1;
                return { ...prev, losses: l, total: t, winRate: Math.round((prev.wins/t)*100) };
            });
        }

        if (processingTimeout.current) clearTimeout(processingTimeout.current);
        processingTimeout.current = setTimeout(() => {
             const nextSignal = analyzePattern(data);
             setSignal(nextSignal);
        }, 5000); 

      } else {
        const newSignal = analyzePattern(data);
        setSignal(newSignal);
      }

    } catch (e) {
      console.error("Erro no update:", e);
      setConnectionError(true);
    }
  };

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 2000);
    return () => {
        clearInterval(interval);
        if (processingTimeout.current) clearTimeout(processingTimeout.current);
    };
  }, [signal.status]); 

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <header className="w-full py-4 px-4 border-b border-red-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-red-900/10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO ROBO PEQUENO */}
            <div className="bg-gradient-to-br from-red-700 to-black p-1.5 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-500/30 w-10 h-10 flex items-center justify-center">
               <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5 L85 25 V70 L50 95 L15 70 V25 Z" fill="#050505" stroke="#fff" strokeWidth="4" />
                  <path d="M25 40 H75 L70 55 H30 Z" fill="#000" stroke="#ef4444" strokeWidth="2" />
                  <rect x="30" y="45" width="40" height="4" fill="#ef4444" className="animate-pulse" />
               </svg>
            </div>
            
            <div>
              <h1 className="text-lg font-tech font-black tracking-tighter text-white leading-none">
                SG APP <span className="text-red-500 neon-text-red">LAURA</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                  {connectionError ? (
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">Offline</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                         <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                        <span className="text-[9px] uppercase tracking-widest text-green-400 font-bold">Online</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
               <button 
                  onClick={onAdminAccess}
                  className="p-2 bg-red-900/40 hover:bg-red-900/60 rounded-full transition-all border border-red-500/30"
                  title="Painel Admin"
              >
                  <Shield className="w-4 h-4 text-white" />
              </button>
            )}
            <button 
                onClick={() => { setLoading(true); updateData(); }}
                className="p-2 bg-white/5 hover:bg-red-900/20 rounded-full transition-all border border-white/10"
            >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
                onClick={onLogout}
                className="p-2 bg-white/5 hover:bg-red-900/20 rounded-full transition-all border border-white/10"
            >
                <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-4 py-6 relative z-10 flex flex-col gap-5">
        
        {/* Info Bar */}
        <div className="flex justify-between items-center px-1">
           <div className="flex items-center gap-2 text-xs text-gray-400">
             <Flame className="w-4 h-4 text-red-500" />
             <span className="uppercase tracking-widest font-bold text-[10px]">SG MODE: ATIVO</span>
           </div>
           <div className="text-[10px] text-gray-500 font-mono">
              USER: {userEmail.split('@')[0].toUpperCase()}
           </div>
        </div>

        {/* Stats */}
        <StatsCard stats={stats} />

        {/* Signal Display (Hero) */}
        <SignalDisplay signal={signal} />

        {/* History Strip */}
        <HistoryBar history={history} />

        {/* Footer Info */}
        <div className="mt-4 border-t border-white/5 pt-4 text-center">
             <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                SYSTEM BY <span className="text-red-800 font-bold">ADMIN ANNYLAURA</span>
             </p>
        </div>

      </main>
    </div>
  );
};

export default GameInterface;