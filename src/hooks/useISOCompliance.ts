
import { useEffect, useRef } from 'react';
import { AuditLogger } from '@/utils/auditLogger';
import { SecurityManager } from '@/utils/securityManager';
import { PerformanceMonitor } from '@/utils/performanceMonitor';

export const useISOCompliance = (componentName: string) => {
  const auditLogger = useRef(AuditLogger.getInstance());
  const securityManager = useRef(SecurityManager.getInstance());
  const performanceMonitor = useRef(PerformanceMonitor.getInstance());
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const monitor = performanceMonitor.current;
    const mount = mountTime.current;
    const logger = auditLogger.current;

    if (mount && logger) {
      logger.logSystemEvent('component_mounted', {
        component: componentName,
        timestamp: mount,
        session_id: Date.now().toString()
      });
    }

    return () => {
      if (monitor && mount && logger) {
        const unmountTime = Date.now();
        logger.logSystemEvent('component_unmounted', {
          component: componentName,
          mount_time: mount,
          unmount_time: unmountTime,
          duration: unmountTime - mount
        });
      }
    };
  }, [componentName]);

  const trackUserAction = async (action: string, details: Record<string, unknown>) => {
    await auditLogger.current.logUserAction(action, {
      component: componentName,
      ...details
    });
  };

  const recordError = async (error: Error, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    await auditLogger.current.log('component_error', 'error', {
      component: componentName,
      error: error.message,
      stack: error.stack
    }, severity);
  };

  const validateSecurity = async () => {
    return await securityManager.current.validateSession();
  };

  const getPerformanceMetrics = () => {
    return performanceMonitor.current.getMetrics();
  };

  return {
    trackUserAction,
    recordError,
    validateSecurity,
    getPerformanceMetrics,
    auditLogger: auditLogger.current,
    securityManager: securityManager.current,
    performanceMonitor: performanceMonitor.current
  };
};
