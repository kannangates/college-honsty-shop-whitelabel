import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { useAuthCleanup } from './auth/useAuthCleanup';
import { useAuthRedirect } from './auth/useAuthRedirect';
import { useBackdoorAuth } from './auth/useBackdoorAuth';
import { useSupabaseAuth } from './auth/useSupabaseAuth';
import { clearBackdoorSession } from './useAuthState';

type UserProfile = Tables<'users'>;

interface UseAuthActionsProps {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  setBackdoorMode: (mode: boolean) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthActions = ({
  setUser,
  setProfile,
  setSession,
  setBackdoorMode,
  setLoading,
  fetchProfile
}: UseAuthActionsProps) => {
  
  const { cleanupAuthState } = useAuthCleanup();
  const { handleSuccessfulLogin } = useAuthRedirect();
  const { attemptBackdoorLogin } = useBackdoorAuth({
    setUser,
    setProfile,
    setSession,
    setBackdoorMode,
    setLoading,
    handleSuccessfulLogin
  });
  const { signInWithSupabase, signUpWithSupabase } = useSupabaseAuth({
    setUser,
    setSession,
    setLoading,
    fetchProfile,
    handleSuccessfulLogin
  });

  const signIn = async (studentId: string, password: string) => {
    console.log('🔑 SignIn attempt for studentId:', studentId);
    
    cleanupAuthState();
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }

    if (attemptBackdoorLogin(studentId, password)) {
      return;
    }

    await signInWithSupabase(studentId, password);
  };

  const signUp = async (
    email: string,
    password: string,
    studentId: string,
    name: string,
    department: string,
    mobileNumber: string,
    role: string,
    shift: string,
    points: number
  ) => {
    cleanupAuthState();
    setLoading(true);

    console.log('🚀 Signup started for:', studentId);

    try {
      await signUpWithSupabase(
        email,
        password,
        studentId,
        name,
        department,
        mobileNumber,
        role,
        shift,
        points
      );
    } catch (error: unknown) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    cleanupAuthState();
    localStorage.removeItem('redirectAfterLogin');
    if (typeof window !== 'undefined' && localStorage.getItem('backdoorMode') === 'true') {
      clearBackdoorSession();
      setUser(null);
      setProfile(null);
      setSession(null);
      setBackdoorMode(false);
      window.location.href = '/auth';
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setBackdoorMode(false);
    window.location.href = '/auth';
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
