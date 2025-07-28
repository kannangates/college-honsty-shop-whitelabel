import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MFASecret } from '@/lib/mfa-utils';

export const useMFA = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<MFASecret | null>(null);

  const setupMFA = useCallback(async (): Promise<MFASecret | null> => {
    if (!user?.email) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set up MFA');
      }
      
      const data = await response.json();
      setMfaSecret(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up MFA');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const verifyMFA = useCallback(async (token: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify MFA');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify MFA');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const disableMFA = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disable MFA');
      }
      
      setMfaSecret(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const checkMFAStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mfa/status');
      
      if (!response.ok) {
        throw new Error('Failed to check MFA status');
      }
      
      const data = await response.json();
      return data.enabled || false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check MFA status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    isLoading,
    error,
    mfaSecret,
    setupMFA,
    verifyMFA,
    disableMFA,
    checkMFAStatus,
  };
};
