
// Enhanced Security Manager with ISO 27001 compliance features
import { AuditLogger } from './auditLogger';

export interface SecurityCompliance {
  score: number;
  issues: string[];
  recommendations: string[];
  lastCheck: Date;
}

export interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivity: number;
  dataAccessViolations: number;
  encryptionStatus: boolean;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected: string;
  recommendation: string;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private auditLogger = AuditLogger.getInstance();
  private securityMetrics: SecurityMetrics = {
    failedLogins: 0,
    suspiciousActivity: 0,
    dataAccessViolations: 0,
    encryptionStatus: true
  };

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  async validateSession(): Promise<boolean> {
    try {
      // Basic security checks that should always pass for valid sessions
      
      // Check if we're in a secure context (HTTPS in production)
      const isSecureContext = window.location.protocol === 'https:' || 
                            window.location.hostname === 'localhost' ||
                            window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext) {
        console.warn('Insecure context detected');
        return false;
      }

      // Check for basic browser security features
      const hasLocalStorage = typeof Storage !== 'undefined';
      if (!hasLocalStorage) {
        console.warn('Local storage not available');
        return false;
      }

      // All basic checks passed
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  async getSecurityScore(): Promise<number> {
    const compliance = this.getComplianceStatus();
    return compliance.score;
  }

  async scanVulnerabilities(): Promise<SecurityVulnerability[]> {
    // Simulate security scan
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for common vulnerabilities
    if (this.securityMetrics.failedLogins > 10) {
      vulnerabilities.push({
        id: 'high-failed-logins',
        severity: 'medium',
        description: 'High number of failed login attempts detected',
        affected: 'Authentication system',
        recommendation: 'Implement account lockout mechanism'
      });
    }

    if (this.securityMetrics.suspiciousActivity > 5) {
      vulnerabilities.push({
        id: 'suspicious-activity',
        severity: 'high',
        description: 'Suspicious activity patterns detected',
        affected: 'User sessions',
        recommendation: 'Review and investigate recent security events'
      });
    }

    return vulnerabilities;
  }

  getComplianceStatus(): SecurityCompliance {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check password policy compliance
    if (!this.checkPasswordPolicy()) {
      issues.push('Weak password policy detected');
      recommendations.push('Implement stronger password requirements');
      score -= 15;
    }

    // Check encryption status
    if (!this.securityMetrics.encryptionStatus) {
      issues.push('Data encryption not properly configured');
      recommendations.push('Enable end-to-end encryption for sensitive data');
      score -= 25;
    }

    // Check for failed login attempts
    if (this.securityMetrics.failedLogins > 10) {
      issues.push('High number of failed login attempts');
      recommendations.push('Implement account lockout mechanisms');
      score -= 10;
    }

    // Check for suspicious activity
    if (this.securityMetrics.suspiciousActivity > 5) {
      issues.push('Suspicious activity detected');
      recommendations.push('Review and investigate recent security events');
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      lastCheck: new Date()
    };
  }

  private checkPasswordPolicy(): boolean {
    // ISO 27001 password policy compliance check
    // In a real implementation, this would check against actual policies
    return true; // Simplified for demo
  }

  async logSecurityEvent(event: string, details: Record<string, unknown>): Promise<void> {
    await this.auditLogger.logSecurityEvent(event, details);
    
    // Update security metrics based on event type
    switch (event) {
      case 'failed_login':
        this.securityMetrics.failedLogins++;
        break;
      case 'suspicious_activity':
        this.securityMetrics.suspiciousActivity++;
        break;
      case 'data_access_violation':
        this.securityMetrics.dataAccessViolations++;
        break;
    }
  }

  getSecurityMetrics(): SecurityMetrics {
    return { ...this.securityMetrics };
  }

  resetSecurityMetrics(): void {
    this.securityMetrics = {
      failedLogins: 0,
      suspiciousActivity: 0,
      dataAccessViolations: 0,
      encryptionStatus: true
    };
  }

  async performSecurityScan(): Promise<SecurityCompliance> {
    console.log('🔍 Performing security scan...');
    
    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const compliance = this.getComplianceStatus();
    
    await this.auditLogger.logSecurityEvent('security_scan_completed', {
      score: compliance.score,
      issues: compliance.issues.length,
      timestamp: new Date().toISOString()
    });
    
    return compliance;
  }

  public sanitizeInput(input: string): string {
    // Basic sanitization against common injection vectors
    return input
      .replace(/[<>&"'`]/g, (char) => {
        const map: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;',
          '`': '&#x60;',
        };
        return map[char] || char;
      })
      .trim();
  }
}
