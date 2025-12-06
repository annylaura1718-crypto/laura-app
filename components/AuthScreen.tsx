import React, { useState } from 'react';
import { authService } from '../services/auth';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (isLogin) {
      const result = await authService.login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message);
      }
    } else {
      const result = await authService.register(email, password);
      if (result.success) {
        setSuccessMsg('Solicitação enviada! Aguarde a liberação da Admin Annylaura.');
        setTimeout(() => setIsLogin(true), 3000);
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm glass-panel p-8 rounded-2xl border border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.1)] relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-900/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          {/* LOGO ROBO PROFISSIONAL */}
          <div className="w-24 h-24 mb-4 relative filter drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Capacete Fundo */}
              <path d="M50 5 L85 25 V70 L50 95 L15 70 V25 Z" fill="#050505" stroke="#ef4444" strokeWidth="2" />
              
              {/* Detalhes Laterais */}
              <path d="M15 35 L25 40 V60 L15 65" stroke="#333" strokeWidth="2" fill="none"/>
              <path d="M85 35 L75 40 V60 L85 65" stroke="#333" strokeWidth="2" fill="none"/>

              {/* Visor Preto */}
              <path d="M25 40 H75 L70 55 H30 Z" fill="#000" stroke="#333" strokeWidth="1" />
              
              {/* Olho Brilhante (Scanline) */}
              <rect x="30" y="45" width="40" height="4" fill="#ef4444" className="animate-pulse">
                 <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
              </rect>
              <circle cx="35" cy="47" r="2" fill="white" className="animate-ping" style={{animationDuration: '3s'}} />

              {/* Queixo/Boca */}
              <path d="M35 75 L65 75" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              <path d="M40 82 L60 82" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
              
              {/* Placas da Testa */}
              <path d="M40 15 L50 25 L60 15" stroke="#333" strokeWidth="2" fill="none"/>
            </svg>
          </div>

          <h1 className="text-2xl font-tech font-bold text-white tracking-widest text-center">
            SG APP <span className="text-red-500 neon-text-red">LAURA</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Acesso Restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-xs text-red-200 flex items-center justify-center text-center animate-pulse">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-xs text-green-200 flex items-center justify-center text-center">
              {successMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/40 border border-red-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? 'ENTRAR NO SISTEMA' : 'SOLICITAR ACESSO'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
            className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            {isLogin ? 'Não tem conta? Solicite Acesso' : 'Já tem conta? Fazer Login'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;