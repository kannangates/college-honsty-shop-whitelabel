
// Enhanced Session Management with Refresh Tokens
import { supabase } from '@/integrations/supabase/client';
import { SecurityManager } from './securityManager';
import { AuditLogger } from './auditLogger';

export interface SessionConfig {
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
  autoRefreshThreshold: number;
  maxSessionDuration: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private securityManager = SecurityManager.getInstance();
  private auditLogger = AuditLogger.getInstance();
  
  private readonly config: SessionConfig = {
    accessTokenExpiry: 60 * 60 * 1000, // 1 hour
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoRefreshThreshold: 5 * 60 * 1000, // 5 minutes
    maxSessionDuration: 24 * 60 * 60 * 1000 // 24 hours
  };

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async initializeSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        await this.auditLogger.logSecurityEvent('session_initialized', {
          userId: session.user.id,
          expiresAt: session.expires_at
        });
        
        this.scheduleTokenRefresh(session.expires_at);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      await this.auditLogger.logSecurityEvent('session_init_failed', { error: (error as Error).message });
    }
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now() / 1000;
    const refreshTime = (expiresAt - now - this.config.autoRefreshThreshold / 1000) * 1000;

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        await this.auditLogger.logSecurityEvent('token_refreshed', {
          userId: data.session.user.id,
          newExpiresAt: data.session.expires_at
        });
        
        this.scheduleTokenRefresh(data.session.expires_at);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.auditLogger.logSecurityEvent('token_refresh_failed', { error: (error as Error).message });
      await this.handleSessionExpiry();
      return false;
    }
  }

  private async handleSessionExpiry(): Promise<void> {
    await this.auditLogger.logSecurityEvent('session_expired', { timestamp: Date.now() });
    await supabase.auth.signOut();
    window.location.href = '/auth';
  }

  async validateSessionSecurity(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;

    // Check session duration
    const sessionStart = new Date(session.user.created_at).getTime();
    const now = Date.now();
    
    if (now - sessionStart > this.config.maxSessionDuration) {
      await this.auditLogger.logSecurityEvent('session_max_duration_exceeded', {
        userId: session.user.id,
        duration: now - sessionStart
      });
      await this.handleSessionExpiry();
      return false;
    }

    return true;
  }

  cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
