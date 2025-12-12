
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { validateStudentId, validatePassword, validatePasswordMatch } from '@/utils/authUtils';
import { WHITELABEL_CONFIG } from '@/config';
import type { SignupResult, LoginResult, AuthSession, UserProfile } from '@/types/auth';
import { NotificationService } from './notificationService';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

interface SignupData {
  email: string;
  password: string;
  student_id: string;
  name: string;
  department: string;
  role: UserRole;
  shift: string;
  points: number;
  captchaToken?: string;
  user_metadata?: Record<string, unknown>;
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
    const messages = WHITELABEL_CONFIG.messages.auth;

    // Validate student ID
    const studentIdValidation = validateStudentId(data.student_id);
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
      errors.push(messages.fill_all_fields || 'Please fill in all required fields');
    }

    // Validate shift
    if (!data.shift || typeof data.shift !== 'string' || !data.shift.trim()) {
      errors.push('Invalid shift value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async signup(data: SignupData): Promise<SignupResult> {
    try {
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
            student_id: data.student_id,
            department: data.department,
            role: data.role,
            shift: data.shift,
            points: data.points,
            ...(data.user_metadata || {})
          },
          captchaToken: data.captchaToken
        }
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
          student_id: data.student_id,
          name: data.name,
          email: data.email,
          department: data.department,
          role: data.role,
          shift: data.shift,
          points: data.points,
          status: 'active'
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

  static async login(studentId: string, password: string): Promise<LoginResult> {
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

      // Construct email using configured domain
      const email = `${studentId}@${WHITELABEL_CONFIG.branding.email_domain}`;

      // Attempt authentication without captcha
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !signInData.session) {
        return { success: false, error: signInError?.message || 'Login failed' };
      }

      // Fetch complete user profile with password_changed_at
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.session.user.id)
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      // Check if password needs to be changed (older than 120 days)
      const PASSWORD_EXPIRY_DAYS = 120;
      const passwordChangedAt = profileData.password_changed_at ? new Date(profileData.password_changed_at) : new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - PASSWORD_EXPIRY_DAYS);

      // If password is expired, set a flag but allow login
      let finalSession = signInData.session;
      if (passwordChangedAt < expiryDate) {
        // Set a flag in user metadata to force password change
        const { data: updateData } = await supabase.auth.updateUser({
          data: { must_change_password: true, password_expired: true }
        });

        // Use the updated session with new metadata
        if (updateData?.user) {
          finalSession = {
            ...signInData.session,
            user: updateData.user
          };
        }
      }

      // Update last signed in timestamp
      await supabase
        .from('users')
        .update({ last_signed_in_at: new Date().toISOString() })
        .eq('id', signInData.session.user.id);

      // Store complete session in sessionStorage
      sessionStorage.setItem('supabase_session', JSON.stringify(finalSession));
      sessionStorage.setItem('user_profile', JSON.stringify(profileData));

      return {
        success: true,
        session: finalSession,
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
      // Session restore error - fail silently
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

  /**
   * Sends a password reset email to the specified email address
   * @param email The email address to send the reset link to
   * @returns Object indicating success or failure
   */
  static async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        NotificationService.showError('Please enter a valid email address');
        return { success: false, error: 'Invalid email format' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      NotificationService.showSuccess(
        WHITELABEL_CONFIG.messages?.auth?.passwordResetSent ||
        'If an account with that email exists, you will receive a password reset link.'
      );

      return { success: true };
    } catch (error) {
      NotificationService.handleEmailError(error, 'password_reset');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  }
}
