import type { Session, User } from '@supabase/supabase-js';

import type { Tables } from '@/integrations/supabase/types';

export type UserProfile = Tables<'users'>;

export type AuthSession = Session;
export type AuthUser = User;

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
