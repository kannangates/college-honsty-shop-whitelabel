
import React, { createContext, useContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useSystemInitialization } from '@/hooks/useSystemInitialization';

type UserProfile = Tables<'users'>;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (studentId: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    studentId: string,
    name: string,
    department: string,
    role: string,
    shift: string,
    points: number,
    captchaToken?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions(authState);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    authState.setProfile((prev) => prev ? { ...prev, ...newProfile } : null);
  };

  const refreshProfile = async () => {
    if (authState.user?.id) {
      try {
        await authState.fetchProfile(authState.user.id);
      } catch (error) {
        console.error('❌ Error refreshing profile:', error);
      }
    }
  };

  // Initialize enhanced system features
  useSystemInitialization();

  const isAdmin =
    authState.profile?.role?.toLowerCase() === 'admin' ||
    authState.profile?.role?.toLowerCase() === 'developer';

  const value: AuthContextType = {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    signIn: authActions.signIn,
    signUp: authActions.signUp,
    signOut: authActions.signOut,
    isAdmin,
    updateProfile,
    refreshProfile,
  };

  // Optimized logging - only log when actually needed
  React.useEffect(() => {
    if (!authState.loading) {
      console.log('✅ Auth ready:', {
        user: authState.user?.email,
        profile: authState.profile?.name,
        isAdmin,
      });
    }
  }, [authState.user, authState.profile, authState.loading, isAdmin]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
