import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

export interface MFAStatus {
  isEnabled: boolean;
  isVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  mfaStatus: MFAStatus;
  isAdmin: boolean;
  signIn: (studentId: string, password: string, skipRedirect?: boolean) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    studentId: string,
    name: string,
    department: string,
    role: string,
    shift: string,
    points: number,
    captchaToken?: string,
    mustChangePassword?: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  // MFA methods
  checkMFAStatus: () => Promise<MFAStatus>;
  verifyMFA: (token: string) => Promise<boolean>;
  setupMFA: () => Promise<{ qrCode: string; secret: string }>;
  enableMFA: (token: string) => Promise<boolean>;
  disableMFA: () => Promise<boolean>;
  verifyMFASession: () => Promise<boolean>;
}
