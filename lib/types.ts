export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  animationStyle: 'typewriter' | 'fadeIn' | 'slideUp';
}

export interface MetaData {
  pageTitle: string;
  description: string;
}

export interface HomeData {
  hero: HeroContent;
  meta: MetaData;
}

export interface DailyConfig {
  daily_fee: number;
  expense_limit: number;
}

export interface SeedUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'conductor' | 'socio';
}

export interface SeedData {
  users: SeedUser[];
  daily_config: DailyConfig;
}

export interface Shift {
  id: string;
  conductor_id: string;
  shift_date: string;
  gross_income: number;
  daily_fee_snapshot: number;
  status: 'ABIERTO' | 'CERRADO';
  closed_by?: string | null;
  closed_at?: string | null;
  created_at: string;
}

export interface CreateShiftRequest {
  gross_income: number;
}

export interface UpdateDailyConfigRequest {
  daily_fee: number;
  expense_limit: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtUser {
  userId: string;
  role: 'admin' | 'conductor' | 'socio';
  email: string;
}

export interface SeedUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'conductor' | 'socio';
}

export interface DailyConfig {
  daily_fee: number;
  expense_limit: number;
}

export interface SeedData {
  users: SeedUser[];
  daily_config: DailyConfig;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtUser {
  userId: string;
  role: 'admin' | 'conductor' | 'socio';
  email: string;
}

export interface AppConfig {
  appName: string;
  version: string;
  locale: string;
  theme: 'light' | 'dark';
}
