
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UseSupabaseAuthProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  handleSuccessfulLogin: () => void;
}

export const useSupabaseAuth = ({
  setUser,
  setSession,
  setLoading,
  fetchProfile,
  handleSuccessfulLogin
}: UseSupabaseAuthProps) => {
  const signInWithSupabase = async (studentId: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { studentId, password },
      });
      
      console.log('📬 Auth response received');
      
      if (error || data.error) {
        throw new Error(error?.message || data.error || 'Login failed');
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
        setSession(data.session);
        setUser(data.session.user);
        
        await fetchProfile(data.session.user.id);
        handleSuccessfulLogin();
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error during sign in');
      console.error('❌ Sign in error:', err);
      setLoading(false);
      throw new Error(err.message || 'Unknown error during sign in');
    }
  };

  const signUpWithSupabase = async (
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
    try {
      const { data, error } = await supabase.functions.invoke('auth-signup', {
        body: {
          studentId,
          name,
          department,
          email,
          password,
          mobile_number: mobileNumber,
          role,
          shift,
          points,
        },
      });

      if (error || data.error) {
        console.error('❌ Signup failed:', error?.message || data.error);
        throw new Error(error?.message || data.error || 'Signup failed');
      }

      console.log('✅ Signup successful');

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !loginData.session) {
        console.error('❌ Auto-login failed:', loginError?.message);
        throw new Error('Signup succeeded, but auto-login failed. Please try signing in manually.');
      }

      console.log('🔐 Auto-login successful');
      setUser(loginData.session.user);
      setSession(loginData.session);
      
      await fetchProfile(loginData.session.user.id);

      console.log('➡️ Redirecting to /dashboard');
      window.location.href = '/dashboard';
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error during signup');
      console.error('❌ Signup error:', err);
      throw err;
    }
  };

  return { signInWithSupabase, signUpWithSupabase };
};
