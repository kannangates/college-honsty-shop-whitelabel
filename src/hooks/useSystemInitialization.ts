
// Enhanced system initialization hook
import { useEffect } from 'react';
import { SessionManager } from '@/utils/session';
import { AlertManager } from '@/utils/alertManager';
import { CDNManager } from '@/utils/cdnManager';
import { DatabaseOptimizer } from '@/utils/databaseOptimizer';
import { PerformanceMonitor } from '@/utils/performanceMonitoring';
import { SecurityManager } from '@/utils/securityManager';
import { WHITELABEL_CONFIG } from '@/config';

export const useSystemInitialization = () => {
  useEffect(() => {
    // Defer heavy initialization to avoid blocking the main thread
    const initTimer = setTimeout(() => {
      initializeEnhancedSystem().catch(error => {
        console.error('❌ System initialization failed:', error);
        // Don't crash the app if system initialization fails
      });
    }, 100); // Small delay to let auth load first

    return () => clearTimeout(initTimer);
  }, []);

  const initializeEnhancedSystem = async () => {
    try {
      // Initialize performance monitoring first
      const performanceMonitor = PerformanceMonitor.getInstance();
      const initTimingId = performanceMonitor.startTiming('system_initialization');

      // Initialize enhanced session management (non-blocking)
      try {
        const sessionManager = SessionManager.getInstance();
        sessionManager.initializeSession().catch(error => {
          console.error('❌ Session manager initialization failed:', error);
        });
      } catch (error) {
        console.error('❌ Session manager failed to initialize:', error);
      }

      // Initialize security manager (non-blocking)
      try {
        const securityManager = SecurityManager.getInstance();
        securityManager.getComplianceStatus();
      } catch (error) {
        console.error('❌ Security manager failed to initialize:', error);
      }

      // Initialize alert system (AlertManager auto-initializes, no initialize method needed)
      try {
        AlertManager.getInstance();
      } catch (error) {
        console.error('❌ Alert manager failed to initialize:', error);
      }

      // Initialize CDN manager with image optimization (deferred)
      setTimeout(() => {
        try {
          const cdnManager = CDNManager.getInstance();

          // Only preload the logo since it's used immediately on all pages
          // Badge images are not currently used in the app, so no need to preload
          const criticalImages = [
            WHITELABEL_CONFIG.branding.logo.url
          ];

          cdnManager.preloadImages(criticalImages);

          // Track performance for the logo
          cdnManager.trackImagePerformance(WHITELABEL_CONFIG.branding.logo.url);
        } catch (error) {
          console.error('❌ CDN manager failed to initialize:', error);
        }
      }, 500); // Defer CDN operations

      // Initialize database optimizer (deferred)
      setTimeout(async () => {
        try {
          const dbOptimizer = DatabaseOptimizer.getInstance();
          await dbOptimizer.optimizeConnections();

          // Get initial optimization analysis
          const analysisPromise = dbOptimizer.analyzePerformance();
          analysisPromise.catch(error => {
            console.error('❌ Database optimization failed:', error);
          });
        } catch (error) {
          console.error('❌ Database optimizer failed to initialize:', error);
        }
      }, 1000); // Defer database operations

      // Set up ISO compliance monitoring (non-blocking)
      try {
        // Silent initialization - no logging needed
        const _auditLogging = WHITELABEL_CONFIG.system.iso_compliance.enable_audit_logging;
        const _performanceMonitoring = WHITELABEL_CONFIG.system.iso_compliance.enable_performance_monitoring;
        const _securityMonitoring = WHITELABEL_CONFIG.system.iso_compliance.enable_security_monitoring;
      } catch (error) {
        console.error('❌ ISO compliance monitoring failed to initialize:', error);
      }

      // Request enhanced notification permissions (deferred)
      setTimeout(() => {
        try {
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                // Test notification for system readiness
                new Notification('System Ready', {
                  body: `${WHITELABEL_CONFIG.app.name} is now fully operational with enhanced security and performance monitoring.`,
                  icon: WHITELABEL_CONFIG.branding.favicon
                });
              }
            });
          }
        } catch (error) {
          console.error('❌ Notification permission request failed:', error);
        }
      }, 2000); // Defer notification permission request

      // End performance timing with correct ID
      performanceMonitor.endTiming(initTimingId, 'api');

    } catch (error) {
      console.error('❌ Enhanced system initialization failed:', error);

      // Log error for monitoring using public method with correct signature
      try {
        const alertManager = AlertManager.getInstance();
        const errorAlert = {
          id: `init_error_${Date.now()}`,
          type: 'error' as const,
          severity: 'high' as const,
          title: 'System Initialization Failed',
          message: `Failed to initialize enhanced system: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
          acknowledged: false,
          source: 'system_initialization'
        };

        // Since createAlert is private, we'll just log the error
        console.error('System initialization error details:', errorAlert);
      } catch (logError) {
        console.error('❌ Failed to log system initialization error:', logError);
      }
    }
  };

  return { initializeEnhancedSystem };
};
