import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User as DatabaseUser } from '@/types/database';

export type UserProfile = DatabaseUser;
export type AuthSession = Session;
export type AuthUser = SupabaseUser;

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface SignupResult extends AuthResult {
  user?: AuthUser;
}

export interface LoginResult extends AuthResult {
  session?: AuthSession;
  profile?: UserProfile;
  requiresPasswordReset?: boolean;
  userId?: string;
}
