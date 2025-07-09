
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { validateStudentId, validatePassword, validatePasswordMatch } from '@/utils/authUtils';
import { getCurrentConfig, getCurrentMessages } from '@/config';
import type { SignupResult, LoginResult, AuthSession, UserProfile } from '@/types/auth';

interface SignupData {
  email: string;
  password: string;
  studentId: string;
  name: string;
  department: string;
  role: Database["public"]["Enums"]["user_role"] | null;
  shift: string;
  points: number;
  captchaToken?: string;
  userMetadata?: Record<string, unknown>;
}

export class AuthService {
  /* uniqueness checks now handled by edge function */
  static async checkStudentIdExists(_studentId: string): Promise<boolean> {
    // Client-side uniqueness check disabled; handled by edge function
    return false;
  }

  static async checkEmailExists(_email: string): Promise<boolean> {
    // Client-side uniqueness check disabled; handled by edge function
    return false;
  }

  static validateSignupData(data: SignupData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const messages = getCurrentMessages();

    // Validate student ID
    const studentIdValidation = validateStudentId(data.studentId);
    if (!studentIdValidation.isValid) {
      errors.push(studentIdValidation.error!);
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.error!);
    }

    // Validate required fields
    if (!data.name || !data.email || !data.department) {
      errors.push(messages.errors?.fill_all_fields || 'Please fill in all required fields');
    }

    // Validate shift
    if (!['1', '2', 'full'].includes(data.shift)) {
      errors.push('Invalid shift value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async signup(data: SignupData): Promise<SignupResult> {
    try {
      console.log('📦 Payload to Supabase Auth:', {
        email: data.email,
        passwordLength: data.password.length,
        studentId: data.studentId,
        name: data.name,
        department: data.department,
        role: data.role,
        shift: data.shift,
        points: data.points,
        captcha: !!data.captchaToken
      });
      // Validate input data
      const validation = this.validateSignupData(data);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      

      // Create user in Supabase Auth with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined, // No email confirmation needed
          data: {
            name: data.name,
            student_id: data.studentId,
            department: data.department,
            
            role: data.role  as Database["public"]["Enums"]["user_role"],
            shift: data.shift,
            points: data.points,
            ...(data.userMetadata || {})
          },
          captchaToken: data.captchaToken
        }
      });
      
      console.log('📨 Supabase auth.signUp response:', {
        authData,
        authError
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Insert user profile into users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          student_id: data.studentId,
          name: data.name,
          email: data.email,
          department: data.department,
          
          role: data.role  as Database["public"]["Enums"]["user_role"],
          shift: data.shift,
          points: data.points,
          status: 'active'
        });

      console.log('🗂️ Supabase user insert response:', {
        profileError
      });

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create user profile: ' + profileError.message };
      }

      return { success: true, user: authData.user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  static async autoLogin(email: string, password: string): Promise<LoginResult> {
    try {
      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !signInData.session) {
        return { success: false, error: signInError?.message || 'Auto-login failed' };
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.session.user.id)
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      // Store complete session in sessionStorage
      sessionStorage.setItem('supabase_session', JSON.stringify(signInData.session));
      sessionStorage.setItem('user_profile', JSON.stringify(profileData));

      return { 
        success: true, 
        session: signInData.session, 
        profile: profileData 
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  static async login(studentId: string, password: string, captchaToken?: string): Promise<LoginResult> {
    try {
      // Validate input
      const studentIdValidation = validateStudentId(studentId);
      if (!studentIdValidation.isValid) {
        return { success: false, error: studentIdValidation.error };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Construct email directly from student ID
      const email = `${studentId}@shasuncollege.edu.in`;

      // Attempt authentication with captcha token
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      });

      if (signInError || !signInData.session) {
        return { success: false, error: signInError?.message || 'Login failed' };
      }

      // Update last signed in timestamp
      await supabase
        .from('users')
        .update({ last_signed_in_at: new Date().toISOString() })
        .eq('id', signInData.session.user.id);

      // Fetch complete user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.session.user.id)
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      // Store complete session in sessionStorage
      sessionStorage.setItem('supabase_session', JSON.stringify(signInData.session));
      sessionStorage.setItem('user_profile', JSON.stringify(profileData));

      return { 
        success: true, 
        session: signInData.session, 
        profile: profileData 
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  static async restoreSession(): Promise<{ session?: AuthSession; profile?: UserProfile }> {
    try {
      // Try to restore from sessionStorage first
      const storedSession = sessionStorage.getItem('supabase_session');
      const storedProfile = sessionStorage.getItem('user_profile');

      if (storedSession && storedProfile) {
        const session = JSON.parse(storedSession);
        const profile = JSON.parse(storedProfile);

        // Verify session is still valid
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && currentSession.user.id === session.user.id) {
          return { session: currentSession, profile };
        }
      }

      // Fallback to Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          sessionStorage.setItem('supabase_session', JSON.stringify(session));
          sessionStorage.setItem('user_profile', JSON.stringify(profileData));
          return { session, profile: profileData };
        }
      }

      return {};
    } catch (error) {
      console.error('Session restore error:', error);
      return {};
    }
  }

  static async signOut(): Promise<void> {
    // Clear sessionStorage
    sessionStorage.removeItem('supabase_session');
    sessionStorage.removeItem('user_profile');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
  }
}
