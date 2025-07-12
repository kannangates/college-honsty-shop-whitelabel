
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { useAuthCleanup } from './auth/useAuthCleanup';
import { useAuthRedirect } from './auth/useAuthRedirect';


import { AuthService } from '@/services/authService';
import type { Database } from '@/integrations/supabase/types';

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
  

  const signIn = async (studentId: string, password: string, captchaToken?: string) => {
    console.log('🔑 SignIn attempt for studentId:', studentId);
    
    cleanupAuthState();
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }

    

    try {
      const result = await AuthService.login(studentId, password, captchaToken);
      
      if (result.success && result.session && result.profile) {
        setSession(result.session);
        setUser(result.session.user);
        setProfile(result.profile);
        handleSuccessfulLogin();
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    studentId: string,
    name: string,
    department: string,
    role: string,
    shift: string,
    points: number,
    captchaToken?: string
  ) => {
    cleanupAuthState();
    setLoading(true);

    console.log('🚀 Signup started for:', studentId);

    try {
      const signupResult = await AuthService.signup({
        email,
        password,
        studentId,
        name,
        department,
        role: role as Database["public"]["Enums"]["user_role"],
        shift,
        points,
        captchaToken,
        userMetadata: { must_change_password: true }
      });

      if (!signupResult.success) {
        throw new Error(signupResult.error);
      }

      // Auto-login after successful signup
      const loginResult = await AuthService.autoLogin(email, password);
      
      if (loginResult.success && loginResult.session && loginResult.profile) {
        setSession(loginResult.session);
        setUser(loginResult.session.user);
        setProfile(loginResult.profile);
        
        console.log('✅ Signup and auto-login successful');
        console.log('➡️ Redirecting to /dashboard');
        window.location.href = '/dashboard';
      } else {
        throw new Error(loginResult.error || 'Auto-login failed after signup');
      }
    } catch (error: unknown) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    cleanupAuthState();
    localStorage.removeItem('redirectAfterLogin');
    
    try {
      await AuthService.signOut();
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
