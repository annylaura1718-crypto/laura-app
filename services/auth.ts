import { User, UserStatus, DailyStats, UserStatsMap, DbConfig } from '../types';
import { initSupabase, supabaseService } from './supabase';

const STORAGE_KEY_USERS = 'sg_laura_users_db_v1';
const STORAGE_KEY_SESSION = 'sg_laura_session_v1';
const STORAGE_KEY_STATS = 'sg_laura_stats_db_v1';

// DADOS DA NUVEM (FIXOS NO CÓDIGO)
const SUPABASE_URL = 'https://nnhbtkswdwbecdtnknig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iSYw87Si6wk3CKtKQCtUPg_9LVUyc69';

// Dados da Administradora Suprema
const ADMIN_EMAIL = 'annylaura1718@gmail.com';
const ADMIN_PASS = 'lauraiablaze89';

// O App agora é sempre Online
const isOnline = true;

// Inicializa a conexão com o banco de dados imediatamente
initSupabase(SUPABASE_URL, SUPABASE_KEY);

const initDB = () => {
  console.log("SISTEMA ONLINE ATIVADO ☁️ (Conectado ao Supabase)");
  
  // Backup Local (Apenas para garantir estrutura caso precise de fallback futuro)
  try {
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    if (!usersStr) {
      const adminUser: User = {
        id: 'admin-001',
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
        status: 'admin',
        createdAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([adminUser]));
    }
  } catch (e) {}
};

initDB();

export const authService = {
  
  // Login Híbrido (Prioridade Nuvem)
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> => {
    await new Promise(r => setTimeout(r, 800));

    try {
      let users: User[] = [];

      if (isOnline) {
        users = await supabaseService.getUsers();
        // Se a lista vier vazia (banco novo) mas for o admin tentando logar, cria o admin na nuvem automaticamente
        if (users.length === 0 && email === ADMIN_EMAIL) {
           console.log("Banco vazio, criando admin inicial...");
           const adminUser: User = { id: 'admin-001', email, password, status: 'admin', createdAt: Date.now() };
           await supabaseService.createUser(adminUser);
           users = [adminUser];
        }
      } else {
        const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
        users = usersStr ? JSON.parse(usersStr) : [];
      }
      
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        return { success: true, user, message: 'Login realizado com sucesso.' };
      }

      return { success: false, message: 'Email ou senha incorretos.' };
    } catch (e) {
      console.error("Erro no login:", e);
      return { success: false, message: 'Erro de conexão com o banco de dados.' };
    }
  },

  // Cadastro Híbrido
  register: async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 800));

    try {
      // 1. Verificar duplicidade
      let users: User[] = [];
      if (isOnline) users = await supabaseService.getUsers();
      else {
        const s = localStorage.getItem(STORAGE_KEY_USERS);
        users = s ? JSON.parse(s) : [];
      }

      if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email já cadastrado.' };
      }

      const isOwner = email === ADMIN_EMAIL;
      const newUser: User = {
        id: isOwner ? 'admin-001' : Math.random().toString(36).substr(2, 9),
        email,
        password,
        status: isOwner ? 'admin' : 'pending',
        createdAt: Date.now()
      };

      if (isOnline) {
        const ok = await supabaseService.createUser(newUser);
        if (!ok) return { success: false, message: 'Erro ao salvar na nuvem. Verifique o SQL no painel.' };
      } else {
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      }

      return { success: true, message: 'Cadastro realizado! Aguarde aprovação.' };
    } catch (e) {
      return { success: false, message: 'Erro ao salvar.' };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  getAllUsers: async (): Promise<User[]> => {
    if (isOnline) return await supabaseService.getUsers();
    
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  updateUserStatus: async (userId: string, newStatus: UserStatus) => {
    if (isOnline) {
      await supabaseService.updateUserStatus(userId, newStatus);
      return;
    }

    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    users = users.map(u => u.id === userId && u.email !== ADMIN_EMAIL ? { ...u, status: newStatus } : u);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  },

  recordGameResult: async (userId: string, result: 'win' | 'loss') => {
    if (isOnline) {
      await supabaseService.saveStats(userId, result);
      return;
    }

    // Fallback Local
    const today = new Date().toISOString().split('T')[0];
    const statsStr = localStorage.getItem(STORAGE_KEY_STATS);
    const allStats: UserStatsMap = statsStr ? JSON.parse(statsStr) : {};

    if (!allStats[userId]) allStats[userId] = {};
    if (!allStats[userId][today]) allStats[userId][today] = { date: today, wins: 0, losses: 0 };

    if (result === 'win') allStats[userId][today].wins++;
    else allStats[userId][today].losses++;

    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(allStats));
  },

  getUserStats: async (userId: string): Promise<DailyStats[]> => {
    if (isOnline) return await supabaseService.getStats(userId);

    const statsStr = localStorage.getItem(STORAGE_KEY_STATS);
    const allStats: UserStatsMap = statsStr ? JSON.parse(statsStr) : {};
    
    if (!allStats[userId]) return [];

    return Object.values(allStats[userId]).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  // Mantido para compatibilidade, mas retorna sempre config fixa
  getCloudConfig: (): DbConfig | null => {
    return {
        url: SUPABASE_URL,
        key: 'PROTECTED',
        active: true
    };
  },
  
  saveCloudConfig: (config: DbConfig) => {
      // No-op
  }
};