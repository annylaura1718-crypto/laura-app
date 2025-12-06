import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { User } from './types';
import AuthScreen from './components/AuthScreen';
import GameInterface from './components/GameInterface';
import AdminDashboard from './components/AdminDashboard';
import { Loader2, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'game'>('dashboard');

  const checkUser = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    // Se for admin, garante que começa no dashboard
    if (user?.status === 'admin') {
      setAdminViewMode('dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  // 1. Se não estiver logado, mostra Login
  if (!currentUser) {
    return (
      <div className="min-h-screen font-sans selection:bg-red-500 selection:text-white bg-black">
        <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <AuthScreen onLoginSuccess={checkUser} />
      </div>
    );
  }

  // 2. Se for Admin E estiver no modo Dashboard
  if (currentUser.status === 'admin' && adminViewMode === 'dashboard') {
    return (
       <div className="min-h-screen font-sans selection:bg-red-500 selection:text-white bg-black">
        <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <AdminDashboard 
          onLogout={handleLogout} 
          onPlay={() => setAdminViewMode('game')} 
        />
      </div>
    );
  }

  // 3. Se estiver pendente ou rejeitado
  if (currentUser.status !== 'approved' && currentUser.status !== 'admin') {
    return (
      <div className="min-h-screen font-sans selection:bg-red-500 selection:text-white bg-black flex items-center justify-center p-4">
         <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
         
         <div className="glass-panel p-8 rounded-xl max-w-sm w-full text-center border border-red-500/30 relative z-10">
           <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
             <Lock className="w-8 h-8 text-red-500" />
           </div>
           <h2 className="text-xl font-tech font-bold text-white mb-2">ACESSO RESTRITO</h2>
           <p className="text-sm text-gray-400 mb-6">
             {currentUser.status === 'pending' 
               ? 'Cadastro realizado com sucesso! Aguarde a liberação da Admin Annylaura.'
               : 'Seu acesso foi recusado pela administração.'}
           </p>
           <button 
             onClick={handleLogout}
             className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-all"
           >
             Voltar / Sair
           </button>
         </div>
      </div>
    );
  }

  // 4. Se estiver aprovado OU (for Admin E estiver no modo Jogo)
  return (
    <div className="min-h-screen pb-10 font-sans selection:bg-red-500 selection:text-white flex flex-col items-center bg-black">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <GameInterface 
        onLogout={handleLogout} 
        userId={currentUser.id}
        userEmail={currentUser.email} 
        isAdmin={currentUser.status === 'admin'}
        onAdminAccess={() => setAdminViewMode('dashboard')}
      />
    </div>
  );
};

export default App;