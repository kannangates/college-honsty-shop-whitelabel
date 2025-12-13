
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User as DatabaseUser, UserRole } from '@/types/database';
import { useAuthCleanup } from './auth/useAuthCleanup';
import { useAuthRedirect } from './auth/useAuthRedirect';
import { AuthService } from '@/services/authService';

type UserProfile = DatabaseUser;

interface UseAuthActionsProps {
  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthActions = ({
  setUser,
  setProfile,
  setSession,
  setLoading,
  fetchProfile
}: UseAuthActionsProps) => {

  const { cleanupAuthState } = useAuthCleanup();
  const { handleSuccessfulLogin } = useAuthRedirect();


  const signIn = async (studentId: string, password: string, skipRedirect: boolean = false) => {
    console.log('🔑 SignIn attempt for studentId:', studentId);

    cleanupAuthState();
    setLoading(true);

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }

    try {
      const result = await AuthService.login(studentId, password);

      if (result.success && result.session && result.profile) {
        setSession(result.session);
        setUser(result.session.user);
        setProfile(result.profile);

        // Only redirect if not skipping (i.e., not waiting for 2FA)
        if (!skipRedirect) {
          handleSuccessfulLogin();
        } else {
          setLoading(false);
        }
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
    captchaToken?: string,
    mustChangePassword: boolean = true // NEW ARGUMENT, default true for admin/bulk
  ) => {
    cleanupAuthState();
    setLoading(true);

    console.log('🚀 Signup started for:', studentId);

    try {
      const signupResult = await AuthService.signup({
        email,
        password,
        student_id: studentId, // FIX: use student_id
        name,
        department,
        role: role as UserRole,
        shift,
        points,
        captchaToken,
        user_metadata: { must_change_password: mustChangePassword } // USE ARGUMENT
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
    window.location.href = '/auth';
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
