import { supabase } from '@/integrations/supabase/client';
import { SecurityManager } from './securityManager';
import { AuditLogger } from './auditLogger';
import { WHITELABEL_CONFIG } from '@/config';

/**
 * Unified Session Management
 * Handles session initialization, token refresh, validation, and cleanup
 */
export class SessionManager {
  private static instance: SessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private validationTimer: NodeJS.Timeout | null = null;
  private sessionStartTime: number = 0;
  private securityManager = SecurityManager.getInstance();
  private auditLogger = AuditLogger.getInstance();

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session tracking and schedule automatic token refresh
   */
  async initializeSession(): Promise<void> {
    try {
      this.sessionStartTime = Date.now();
      const session = await this.getCurrentSession();
      
      if (session) {
        if (process.env.NODE_ENV === 'development') {
          await this.auditLogger.logSecurityEvent('session_initialized', {
            userId: session.user.id,
            expiresAt: session.expires_at,
            sessionStartTime: this.sessionStartTime
          });
        }
        
        this.scheduleTokenRefresh(session.expires_at);
        this.scheduleSessionValidation();
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      await this.auditLogger.logSecurityEvent('session_init_failed', { 
        error: (error as Error).message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Refresh the current session
   */
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  }

  /**
   * Check if session token is expired
   */
  isSessionExpired(expiresAt: number): boolean {
    const now = Date.now() / 1000;
    return expiresAt < now;
  }

  /**
   * Calculate when to refresh the token (5 minutes before expiry)
   */
  private calculateRefreshTime(expiresAt: number): number {
    const now = Date.now() / 1000;
    return (expiresAt - now - 300) * 1000; // 5 minutes before expiry
  }

  /**
   * Check if session has exceeded maximum allowed duration
   */
  private hasExceededMaxDuration(): boolean {
    if (this.sessionStartTime === 0) return false;
    const sessionDuration = Date.now() - this.sessionStartTime;
    return sessionDuration > Number(WHITELABEL_CONFIG.system.performance.session_timeout);
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshTime = this.calculateRefreshTime(expiresAt);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * Schedule periodic session validation
   */
  private scheduleSessionValidation(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    this.validationTimer = setInterval(() => {
      this.validateSessionSecurity();
    }, WHITELABEL_CONFIG.SECURITY.session_validation_interval);
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const session = await this.refreshSession();
      
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
      console.error('Token refresh failed:', error);
      await this.auditLogger.logSecurityEvent('token_refresh_failed', { 
        error: (error as Error).message,
        timestamp: Date.now()
      });
      await this.handleSessionExpiry();
      return false;
    }
  }

  /**
   * Validate session security (checks duration and token validity)
   */
  async validateSessionSecurity(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      
      if (!session) {
        console.log('No session found during validation');
        return false;
      }

      // Check session duration
      if (this.hasExceededMaxDuration()) {
        console.log('Session expired - forcing logout');
        await this.auditLogger.logSecurityEvent('session_max_duration_exceeded', {
          userId: session.user.id,
          duration: Date.now() - this.sessionStartTime,
        });
        await this.forceLogout('Session max duration exceeded');
        return false;
      }

      // Check if session token is expired
      if (session.expires_at && this.isSessionExpired(session.expires_at)) {
        console.log('Session token expired');
        await this.handleSessionExpiry();
        return false;
      }

      // Validate with security manager
      const isSecure = await this.securityManager.validateSession();
      if (!isSecure) {
        console.log('Security validation failed');
        await this.forceLogout('Security validation failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session security validation failed:', error);
      await this.auditLogger.logSecurityEvent('session_validation_failed', {
        error: (error as Error).message,
        timestamp: Date.now()
      });
      return false;
    }
  }

  /**
   * Handle session expiry
   */
  private async handleSessionExpiry(): Promise<void> {
    await this.auditLogger.logSecurityEvent('session_expired', { 
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    });
    
    this.cleanup();
    await supabase.auth.signOut();
    window.location.href = '/auth?expired=true';
  }

  /**
   * Force logout with a specific reason
   */
  async forceLogout(reason: string): Promise<void> {
    await this.auditLogger.logSecurityEvent('forced_logout', {
      reason,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    });
    
    this.cleanup();
    await supabase.auth.signOut();
    window.location.href = '/auth';
  }

  /**
   * Clean up timers and reset session state
   */
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

  /**
   * Get current session information
   */
  getSessionInfo(): { isActive: boolean; duration: number; startTime: number } {
    return {
      isActive: this.sessionStartTime > 0,
      duration: this.sessionStartTime > 0 ? Date.now() - this.sessionStartTime : 0,
      startTime: this.sessionStartTime
    };
  }
}
