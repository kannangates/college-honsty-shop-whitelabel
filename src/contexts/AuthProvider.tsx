import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useSystemInitialization } from '@/hooks/useSystemInitialization';
import type { AuthContextType, MFAStatus } from './AuthContext.types';
import type { UserProfile } from '@/types/auth';
import { AuthContext } from './AuthContext';
import { apiCall } from '@/lib/api-client';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions(authState);
  const [mfaStatus, setMfaStatus] = useState<MFAStatus>({
    isEnabled: false,
    isVerified: false,
  });
  const [isCheckingMFA, setIsCheckingMFA] = useState(false);
  const [lastMFACheck, setLastMFACheck] = useState<string | null>(null);

  // MFA Status Management
  const checkMFAStatus = useCallback(async (): Promise<MFAStatus> => {
    try {
      setIsCheckingMFA(true);

      // Only check MFA status if user is logged in
      if (!authState.user?.id) {
        const defaultStatus = {
          isEnabled: false,
          isVerified: true
        };
        setMfaStatus(defaultStatus);
        return defaultStatus;
      }

      // Prevent rapid successive calls for the same user
      const currentUserId = authState.user!.id; // Safe because we checked authState.user?.id above
      if (lastMFACheck === currentUserId) {
        return mfaStatus;
      }

      const response = await apiCall('/functions/v1/mfa-status');

      if (!response.ok) {
        throw new Error('Failed to check MFA status');
      }

      const data = await response.json();
      const status = {
        isEnabled: data.enabled || false,
        isVerified: data.enabled ? false : true // If MFA is enabled, require verification
      };

      setMfaStatus(status);
      setLastMFACheck(currentUserId);
      return status;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      // Return safe defaults on error
      const defaultStatus = {
        isEnabled: false,
        isVerified: true
      };
      setMfaStatus(defaultStatus);
      return defaultStatus;
    } finally {
      setIsCheckingMFA(false);
    }
  }, [authState.user, lastMFACheck, mfaStatus]);

  // Check MFA status when user logs in (only once per user)
  useEffect(() => {
    if (authState.user?.id && !isCheckingMFA && !authState.loading && lastMFACheck !== authState.user.id) {
      checkMFAStatus().catch(console.error);
    }
  }, [authState.user?.id, authState.loading, lastMFACheck, isCheckingMFA, checkMFAStatus]);

  // MFA Methods
  const verifyMFA = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await apiCall('/functions/v1/mfa-verify', {
        method: 'POST',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide user-friendly error messages
        let errorMessage = 'Failed to verify MFA token';
        if (data.error) {
          if (data.error.includes('Invalid token')) {
            errorMessage = 'Invalid verification code. Please check your authenticator app and try again.';
          } else if (data.error.includes('MFA not set up')) {
            errorMessage = 'MFA is not set up for your account.';
          } else {
            errorMessage = data.error;
          }
        }
        throw new Error(errorMessage);
      }

      setMfaStatus(prev => ({
        ...prev,
        isVerified: data.verified
      }));

      return data.verified;
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      throw error;
    }
  }, []);

  const setupMFA = useCallback(async () => {
    try {
      const response = await apiCall('/functions/v1/mfa-setup', {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up MFA');
      }

      return data;
    } catch (error) {
      console.error('Error setting up MFA:', error);
      throw error;
    }
  }, []);

  const enableMFA = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await apiCall('/functions/v1/mfa-verify', {
        method: 'POST',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable MFA');
      }

      setMfaStatus({
        isEnabled: true,
        isVerified: true
      });

      return true;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      throw error;
    }
  }, []);

  const disableMFA = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiCall('/functions/v1/mfa-disable', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable MFA');
      }

      setMfaStatus({
        isEnabled: false,
        isVerified: false
      });

      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw error;
    }
  }, []);

  // Profile Management
  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    authState.setProfile(prev =>
      prev ? { ...prev, ...newProfile } as UserProfile : null
    );
  }, [authState]);

  const refreshProfile = useCallback(async () => {
    if (authState.user?.id) {
      try {
        await authState.fetchProfile(authState.user!.id); // Safe because we checked authState.user?.id above
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  }, [authState]);

  // Initialize system features
  useSystemInitialization();

  // Check admin status using secure user_roles table
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!authState.user?.id) {
        setIsAdmin(false);
        return;
      }

      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authState.user!.id) // Safe because we checked authState.user?.id above
          .single();

        const adminRoles = ['admin', 'developer'];
        setIsAdmin(adminRoles.includes(userRole?.role?.toLowerCase() || ''));
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [authState.user, authState.user?.id]);

  // Context value
  const value: AuthContextType = {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading || isCheckingMFA,
    mfaStatus,
    isAdmin,
    signIn: authActions.signIn,
    signUp: authActions.signUp,
    signOut: authActions.signOut,
    logout: authActions.signOut,
    updateProfile,
    refreshProfile,
    checkMFAStatus,
    verifyMFA,
    setupMFA,
    enableMFA,
    disableMFA,
    verifyMFASession: async () => {
      // Check if MFA is enabled for this user
      const status = await checkMFAStatus();
      if (!status.isEnabled) {
        return true; // MFA not enabled, allow access
      }
      return status.isVerified; // Return actual verification status
    },
  };

  // Update auth state when changes occur
  useEffect(() => {
    if (!authState.loading && !isCheckingMFA) {
      // Auth state updated
    }
  }, [authState.loading, authState.user, mfaStatus, isAdmin, isCheckingMFA]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
