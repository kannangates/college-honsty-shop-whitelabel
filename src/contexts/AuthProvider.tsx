import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useSystemInitialization } from '@/hooks/useSystemInitialization';
import type { AuthContextType, MFAStatus } from './AuthContext.types';
import type { UserProfile } from '@/types/auth';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions(authState);
  const [mfaStatus, setMfaStatus] = useState<MFAStatus>({
    isEnabled: false,
    isVerified: false,
  });
  const [isCheckingMFA, setIsCheckingMFA] = useState(false);

  // MFA Status Management
  const checkMFAStatus = useCallback(async (): Promise<MFAStatus> => {
    try {
      setIsCheckingMFA(true);
      const response = await fetch('/api/mfa/status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check MFA status');
      }
      
      setMfaStatus({
        isEnabled: data.isEnabled,
        isVerified: data.isVerified
      });
      
      return data;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      throw error;
    } finally {
      setIsCheckingMFA(false);
    }
  }, []);

  // Check MFA status on mount and when user changes
  useEffect(() => {
    if (authState.user?.id && !isCheckingMFA) {
      checkMFAStatus().catch(console.error);
    }
  }, [authState.user?.id, checkMFAStatus, isCheckingMFA]);

  // MFA Methods
  const verifyMFA = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify MFA token');
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
      const response = await fetch('/api/mfa/setup');
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
      const response = await fetch('/api/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('/api/mfa/disable', {
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
    authState.setProfile(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...newProfile } as UserProfile : null,
    }));
  }, [authState]);

  const refreshProfile = useCallback(async () => {
    if (authState.user?.id) {
      try {
        await authState.refreshProfile();
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  }, [authState]);

  // Initialize system features
  useSystemInitialization();

  const isAdmin = authState.profile?.role?.toLowerCase() === 'admin' || 
                 authState.profile?.role?.toLowerCase() === 'developer';

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
  };

  // Debug logging
  useEffect(() => {
    if (!authState.loading && !isCheckingMFA) {
      console.log('✅ Auth state updated:', {
        user: authState.user?.email,
        mfaStatus,
        isAdmin
      });
    }
  }, [authState.loading, authState.user, mfaStatus, isAdmin, isCheckingMFA]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
