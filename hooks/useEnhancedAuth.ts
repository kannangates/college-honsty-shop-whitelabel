
import { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionManager } from '@/utils/sessionManager';
import { AlertManager } from '@/utils/alertManager';

export const useEnhancedAuth = () => {
  const auth = useAuth();
  
  // Memoize managers to prevent recreation on every render
  const { sessionManager, alertManager } = useMemo(() => ({
    sessionManager: SessionManager.getInstance(),
    alertManager: AlertManager.getInstance()
  }), []);

  // Memoize derived values
  const enhancedAuth = useMemo(() => ({
    ...auth,
    isAuthenticated: !!auth.user,
    hasProfile: !!auth.profile,
  }), [auth]);

  useEffect(() => {
    if (enhancedAuth.isAuthenticated) {
      // Initialize enhanced session management
      sessionManager.initializeSession();
      
      // Set up session validation interval with cleanup
      const validationInterval = setInterval(() => {
        sessionManager.validateSessionSecurity();
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => {
        clearInterval(validationInterval);
        sessionManager.cleanup();
      };
    }
  }, [enhancedAuth.isAuthenticated, sessionManager]);

  const enhancedSignOut = useMemo(() => async () => {
    await sessionManager.cleanup();
    await auth.signOut();
  }, [sessionManager, auth.signOut]);

  const forceRefreshToken = useMemo(() => async () => {
    return await sessionManager.refreshToken();
  }, [sessionManager]);

  return {
    ...enhancedAuth,
    signOut: enhancedSignOut,
    refreshToken: forceRefreshToken,
    sessionManager,
    alertManager
  };
};
