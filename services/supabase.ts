import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, DailyStats } from '../types';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  if (!url || !key) return;
  try {
    supabase = createClient(url, key);
  } catch (e) {
    console.error("Erro ao iniciar Supabase", e);
  }
};

export const supabaseService = {
  // Usuários
  getUsers: async (): Promise<User[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Erro get users:', error);
      return [];
    }
    return data || [];
  },

  createUser: async (user: User): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('users').insert([{
      id: user.id,
      email: user.email,
      password: user.password,
      status: user.status,
      role: user.status === 'admin' ? 'admin' : 'user',
      created_at: user.createdAt
    }]);
    return !error;
  },

  updateUserStatus: async (userId: string, status: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('users').update({ status }).eq('id', userId);
    return !error;
  },

  // Estatísticas
  saveStats: async (userId: string, result: 'win' | 'loss') => {
    if (!supabase) return;
    const date = new Date().toISOString().split('T')[0];
    
    // Verifica se já tem registro hoje
    const { data: existing } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      const updates = result === 'win' 
        ? { wins: existing.wins + 1 } 
        : { losses: existing.losses + 1 };
        
      await supabase.from('daily_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('daily_stats').insert([{
        user_id: userId,
        date: date,
        wins: result === 'win' ? 1 : 0,
        losses: result === 'loss' ? 1 : 0
      }]);
    }
  },

  getStats: async (userId: string): Promise<DailyStats[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) return [];
    return data || [];
  }
};