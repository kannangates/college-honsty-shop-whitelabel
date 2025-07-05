
import { SecurityManager } from './securityManager';
import { AuditLogger } from './auditLogger';
import { SessionUtils } from './sessionUtils';

export class SessionValidation {
  private static securityManager = SecurityManager.getInstance();
  private static auditLogger = AuditLogger.getInstance();

  static async validateSessionSecurity(sessionStartTime: number): Promise<boolean> {
    try {
      const session = await SessionUtils.getCurrentSession();
      
      if (!session) {
        console.log('No session found during validation');
        return false;
      }

      // Check session duration
      if (SessionUtils.hasExceededMaxDuration(sessionStartTime)) {
        console.log('Session expired - forcing logout');
        await this.auditLogger.logSecurityEvent('session_max_duration_exceeded', {
          userId: session.user.id,
          duration: Date.now() - sessionStartTime,
        });
        return false;
      }

      // Check if session token is expired
      if (session.expires_at && SessionUtils.isSessionExpired(session.expires_at)) {
        console.log('Session token expired');
        return false;
      }

      // Validate with security manager
      const isSecure = await this.securityManager.validateSession();
      if (!isSecure) {
        console.log('Security validation failed');
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
}
