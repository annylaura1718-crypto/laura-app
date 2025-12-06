import React, { useState, useEffect } from 'react';
import { User, DailyStats } from '../types';
import { authService } from '../services/auth';
import { Shield, Check, X, User as UserIcon, LogOut, Search, Gamepad2, FileBarChart2, CloudLightning, HelpCircle, AlertTriangle, Database } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onPlay: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onPlay }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<DailyStats[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Cloud Help Modal
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const loadUsers = async () => {
    const list = await authService.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: 'approved' | 'rejected') => {
    await authService.updateUserStatus(userId, status);
    loadUsers();
  };

  const handleOpenReport = async (user: User) => {
    const stats = await authService.getUserStats(user.id);
    setUserStats(stats);
    setSelectedUser(user);
    setIsReportOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 max-w-4xl mx-auto">
      <div className="glass-panel rounded-2xl border border-red-500/20 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-tech font-bold text-white">PAINEL ADMINISTRATIVO</h1>
               <div className="flex items-center gap-2">
                 <p className="text-xs text-red-400 font-mono">ANNYLAURA</p>
                 <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-900/20 px-1 rounded border border-green-500/20">
                     <CloudLightning size={10} /> SISTEMA ONLINE
                 </span>
               </div>
             </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
             <button 
              onClick={() => setIsHelpOpen(true)}
              className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-xs text-blue-300 font-bold flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4" />
              AJUDA SQL
            </button>

            <button 
              onClick={onPlay}
              className="px-3 py-2 bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 border border-green-500/30 rounded-lg text-xs text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
            >
              <Gamepad2 className="w-4 h-4" />
              JOGO
            </button>
            
            <button 
              onClick={onLogout}
              className="px-3 py-2 bg-white/5 hover:bg-red-900/30 border border-white/10 rounded-lg text-xs text-gray-300 flex items-center gap-2 transition-all"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Stats/Filter */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
              <div className="text-gray-400">Total: <span className="text-white">{filteredUsers.length}</span></div>
              <div className="text-yellow-500">Pendentes: <span className="text-white">{filteredUsers.filter(u => u.status === 'pending').length}</span></div>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                Nenhum usuário encontrado.<br/>
                <span className="text-xs opacity-50">Se o banco foi recém criado, cadastre-se ou aguarde registros.</span>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 group hover:bg-white/10 transition-all">
                  
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      user.status === 'admin' ? 'bg-purple-600/20 text-purple-400' :
                      user.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.status === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate flex items-center gap-2">
                        {user.email}
                        {user.status === 'admin' && <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1 rounded">VOCÊ</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          user.status === 'admin' ? 'bg-purple-900/30 border-purple-500/30 text-purple-400' :
                          user.status === 'approved' ? 'bg-green-900/30 border-green-500/30 text-green-400' :
                          user.status === 'rejected' ? 'bg-red-900/30 border-red-500/30 text-red-400' :
                          'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'
                        }`}>
                          {user.status === 'admin' ? 'MASTER ADMIN' : user.status === 'approved' ? 'Aprovado' : user.status === 'rejected' ? 'Recusado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleOpenReport(user)}
                      className="px-3 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 transition-all"
                      title="Ver Relatório"
                    >
                      <FileBarChart2 className="w-4 h-4" />
                    </button>

                    {user.status !== 'admin' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(user.id, 'rejected')}
                          className={`px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-all ${user.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={user.status === 'rejected'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(user.id, 'approved')}
                          className={`px-3 py-2 rounded-lg border border-green-500/30 hover:bg-green-500/20 text-green-400 transition-all ${user.status === 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={user.status === 'approved'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SQL HELP MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="glass-panel w-full max-w-md rounded-xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-blue-900/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Instruções do Banco de Dados
                </h3>
                <button onClick={() => setIsHelpOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                 <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-500/20">
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      O aplicativo já está conectado à nuvem automaticamente. Se os usuários não estiverem sendo salvos, rode o comando abaixo no site do Supabase para criar as tabelas.
                    </p>
                 </div>

                 <div className="bg-black/30 p-3 rounded text-[10px] text-gray-500 font-mono overflow-x-auto border border-white/5 relative">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold">
                       <AlertTriangle className="w-3 h-3" />
                       <span>SQL NECESSÁRIO (SQL Editor)</span>
                    </div>
                    <div className="select-all cursor-text text-gray-300 bg-black/50 p-2 rounded border border-white/10">
<pre>{`-- 1. Cria tabelas
create table if not exists users (
  id text primary key,
  email text unique,
  password text,
  status text,
  role text,
  created_at bigint
);

create table if not exists daily_stats (
  id bigint generated by default as identity primary key,
  user_id text references users(id),
  date text,
  wins int default 0,
  losses int default 0
);

-- 2. DESTRAVA O ACESSO (IMPORTANTE!)
alter table users disable row level security;
alter table daily_stats disable row level security;`}</pre>
                    </div>
                 </div>
                 
                 <div className="text-center">
                    <button onClick={() => setIsHelpOpen(false)} className="px-4 py-2 bg-white/10 rounded text-xs text-white hover:bg-white/20">
                        Entendi, fechar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {isReportOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileBarChart2 className="w-5 h-5 text-blue-400" />
                  Relatório: {selectedUser.email.split('@')[0]}
                </h3>
              </div>
              <button onClick={() => setIsReportOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4 text-center">Wins</th>
                    <th className="p-4 text-center">Loss</th>
                    <th className="p-4 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {userStats.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Sem dados.</td></tr>
                  ) : (
                    userStats.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-gray-300 font-mono">{new Date(stat.date).toLocaleDateString()}</td>
                        <td className="p-4 text-center text-green-400 font-bold">{stat.wins}</td>
                        <td className="p-4 text-center text-red-400 font-bold">{stat.losses}</td>
                        <td className="p-4 text-right">
                          <span className={`font-bold px-2 py-1 rounded text-xs ${(stat.wins - stat.losses) >= 0 ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                            {(stat.wins - stat.losses) > 0 ? '+' : ''}{stat.wins - stat.losses}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
              <button onClick={() => setIsReportOpen(false)} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white font-bold transition-all">Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;