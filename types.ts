export type BlazeColor = 'red' | 'black' | 'white';

export interface BlazeRoll {
  id: string;
  color: BlazeColor;
  roll: number;
  created_at: string;
}

export interface ApiRollResponse {
  id: string;
  color: number; // 1 = Red, 2 = Black, 0 = White
  roll: number;
  created_at: string;
}

export interface SignalState {
  status: 'analyzing' | 'confirming' | 'bet' | 'win' | 'loss';
  predictedColor: BlazeColor | null;
  message: string;
  timestamp: number;
}

export interface Stats {
  wins: number;
  losses: number;
  total: number;
  winRate: number;
  assertiveness: string;
}

// Auth Types
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string; // Armazenado simplificado para simulação
  status: UserStatus;
  createdAt: number;
}

// Stats Reporting Types
export interface DailyStats {
  date: string;     // Formato YYYY-MM-DD
  wins: number;
  losses: number;
}

export interface UserStatsMap {
  [userId: string]: {
    [date: string]: DailyStats;
  };
}

export interface DbConfig {
  url: string;
  key: string;
  active: boolean;
}