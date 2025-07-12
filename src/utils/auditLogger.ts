
// ISO 14155 - Audit and Compliance
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id?: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private pendingLogs: AuditLog[] = [];
  private batchSize = 10;
  private flushInterval = 10000; // Increased from 5000ms to 10000ms to reduce frequency
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
      AuditLogger.instance.startAutoFlush();
    }
    return AuditLogger.instance;
  }

  async log(action: string, resourceType: string, details: Record<string, unknown>, severity: AuditLog['severity'] = 'low'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const auditLog: AuditLog = {
        user_id: user?.id || 'anonymous',
        action,
        resource_type: resourceType,
        details: this.sanitizeDetails(details),
        severity,
        ip_address: await this.getClientIP(),
        user_agent: this.getSanitizedUserAgent(),
        created_at: new Date().toISOString()
      };

      this.pendingLogs.push(auditLog);

      // Critical events should be logged immediately
      if (severity === 'critical' || this.pendingLogs.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async logUserAction(action: string, details: Record<string, unknown>): Promise<void> {
    await this.log(action, 'user_action', details, 'low');
  }

  async logSecurityEvent(action: string, details: Record<string, unknown>): Promise<void> {
    await this.log(action, 'security', details, 'high');
  }

  async logTransaction(action: string, details: Record<string, unknown>): Promise<void> {
    await this.log(action, 'transaction', details, 'medium');
  }

  async logSystemEvent(action: string, details: Record<string, unknown>): Promise<void> {
    await this.log(action, 'system', details, 'low');
  }

  async logPerformanceEvent(action: string, details: Record<string, unknown>): Promise<void> {
    await this.log(action, 'performance', details, 'low');
  }

  private sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string') {
        // Remove potential sensitive data
        sanitized[key] = value.replace(/password|token|secret|key/gi, '[REDACTED]');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeDetails(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private async flush(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToFlush = [...this.pendingLogs];
    this.pendingLogs = [];

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        // Only log critical and high severity events to console to reduce noise
        const criticalLogs = logsToFlush.filter(log => log.severity === 'critical' || log.severity === 'high');
        
        if (criticalLogs.length > 0) {
          console.group('📊 Critical Audit Logs');
          criticalLogs.forEach(log => {
            const logLevel = log.severity === 'critical' ? 'error' : 'warn';
            console[logLevel](`[${log.severity.toUpperCase()}] ${log.action}:`, {
              user: log.user_id,
              resource: log.resource_type,
              details: log.details,
              timestamp: log.created_at,
              ip: log.ip_address
            });
          });
          console.groupEnd();
        }
        
        // For low/medium severity logs, only log if in development mode
        if (process.env.NODE_ENV === 'development') {
          const devLogs = logsToFlush.filter(log => log.severity === 'low' || log.severity === 'medium');
          if (devLogs.length > 0) {
            console.group('📊 Dev Audit Logs');
            devLogs.forEach(log => {
              console.info(`[${log.severity.toUpperCase()}] ${log.action}:`, {
                user: log.user_id,
                resource: log.resource_type,
                details: log.details,
                timestamp: log.created_at,
                ip: log.ip_address
              });
            });
            console.groupEnd();
          }
        }
        
        return;
      } catch (error) {
        retries++;
        console.error(`Failed to flush audit logs (attempt ${retries}):`, error);
        
        if (retries < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * retries));
        }
      }
    }

    // If all retries failed, put logs back in queue
    this.pendingLogs.unshift(...logsToFlush);
  }

  private startAutoFlush(): void {
    setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.flush().catch(error => {
          console.error('Auto-flush failed:', error);
        });
      }
    }, this.flushInterval);
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getSanitizedUserAgent(): string {
    return navigator.userAgent.slice(0, 200); // Limit length to prevent abuse
  }

  // Get audit statistics for compliance reporting
  getAuditStats(): {
    pendingLogs: number;
    batchSize: number;
    flushInterval: number;
  } {
    return {
      pendingLogs: this.pendingLogs.length,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval
    };
  }

  // Force immediate flush for critical events
  async forcefulFlush(): Promise<void> {
    await this.flush();
  }
}
