import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  student_id: string;
  name: string;
  email: string;
  department: string;
  mobile_number: string;
  role: string;
  shift?: string;
  points?: number;
  status: string;
}

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
}
