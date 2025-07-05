
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
    // Track component mount with performance marking
    performanceMonitor.current.markStart(`component-${componentName}`);
    console.log(`📊 Component ${componentName} mounted at: ${new Date().toISOString()}`);

    // Log component initialization
    auditLogger.current.logUserAction('component_mounted', {
      component: componentName,
      timestamp: new Date().toISOString()
    });

    // Cleanup on unmount
    return () => {
      performanceMonitor.current.markEnd(`component-${componentName}`);
      
      const sessionDuration = Date.now() - mountTime.current;
      auditLogger.current.logUserAction('component_unmounted', {
        component: componentName,
        sessionDuration,
        timestamp: new Date().toISOString()
      });
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
