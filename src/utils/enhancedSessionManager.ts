
import { supabase } from '@/integrations/supabase/client';
import { AuditLogger } from './auditLogger';
import { SessionUtils } from './sessionUtils';
import { SessionValidation } from './sessionValidation';
import { WHITELABEL_CONFIG } from '@/config';

export class EnhancedSessionManager {
  private static instance: EnhancedSessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private validationTimer: NodeJS.Timeout | null = null;
  private auditLogger = AuditLogger.getInstance();
  private sessionStartTime: number = 0;

  static getInstance(): EnhancedSessionManager {
    if (!EnhancedSessionManager.instance) {
      EnhancedSessionManager.instance = new EnhancedSessionManager();
    }
    return EnhancedSessionManager.instance;
  }

  async initializeSession(): Promise<void> {
    try {
      this.sessionStartTime = Date.now();
      const session = await SessionUtils.getCurrentSession();
      
      if (session) {
        // Only log session initialization in development mode
        if (process.env.NODE_ENV === 'development') {
          await this.auditLogger.logSecurityEvent('enhanced_session_initialized', {
            userId: session.user.id,
            expiresAt: session.expires_at,
            sessionStartTime: this.sessionStartTime
          });
        }
        
        this.scheduleTokenRefresh(session.expires_at);
        this.scheduleSessionValidation();
      }
    } catch (error) {
      console.error('Failed to initialize enhanced session:', error);
      await this.auditLogger.logSecurityEvent('session_init_failed', { 
        error: (error as Error).message,
        timestamp: Date.now()
      });
    }
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshTime = SessionUtils.calculateRefreshTime(expiresAt);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  private scheduleSessionValidation(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    this.validationTimer = setInterval(() => {
      this.validateSessionSecurity();
    }, WHITELABEL_CONFIG.SECURITY.session_validation_interval);
  }

  async refreshToken(): Promise<boolean> {
    try {
      const session = await SessionUtils.refreshSession();
      
      if (session) {
        await this.auditLogger.logSecurityEvent('token_refreshed', {
          userId: session.user.id,
          newExpiresAt: session.expires_at,
          refreshTime: Date.now()
        });
        
        this.scheduleTokenRefresh(session.expires_at);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Enhanced token refresh failed:', error);
      await this.auditLogger.logSecurityEvent('token_refresh_failed', { 
        error: (error as Error).message,
        timestamp: Date.now()
      });
      await this.handleSessionExpiry();
      return false;
    }
  }

  async validateSessionSecurity(): Promise<boolean> {
    return await SessionValidation.validateSessionSecurity(this.sessionStartTime);
  }

  private async handleSessionExpiry(): Promise<void> {
    await this.auditLogger.logSecurityEvent('session_expired_handled', { 
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    });
    
    this.cleanup();
    await supabase.auth.signOut();
    window.location.href = '/auth?expired=true';
  }

  async forceLogout(reason: string): Promise<void> {
    await this.auditLogger.logSecurityEvent('forced_logout', {
      reason,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    });
    
    this.cleanup();
    await supabase.auth.signOut();
    window.location.href = '/auth?forced=true';
  }

  cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }
    
    this.sessionStartTime = 0;
  }

  getSessionInfo(): {
    isActive: boolean;
    duration: number;
    startTime: number;
  } {
    return {
      isActive: this.sessionStartTime > 0,
      duration: Date.now() - this.sessionStartTime,
      startTime: this.sessionStartTime
    };
  }
}
