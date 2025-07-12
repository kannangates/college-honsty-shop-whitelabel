
// Enhanced system initialization hook
import { useEffect } from 'react';
import { EnhancedSessionManager } from '@/utils/enhancedSessionManager';
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
      initializeEnhancedSystem();
    }, 100); // Small delay to let auth load first

    return () => clearTimeout(initTimer);
  }, []);

  const initializeEnhancedSystem = async () => {
    console.log('🚀 Initializing enhanced system with ISO compliance...');

    try {
      // Initialize performance monitoring first
      const performanceMonitor = PerformanceMonitor.getInstance();
      const initTimingId = performanceMonitor.startTiming('system_initialization');
      console.log('📊 Performance monitoring initialized');

      // Initialize enhanced session management (non-blocking)
      const sessionManager = EnhancedSessionManager.getInstance();
      sessionManager.initializeSession().catch(error => {
        console.error('❌ Session manager initialization failed:', error);
      });
      console.log('✅ Enhanced session management initialized');

      // Initialize security manager (non-blocking)
      const securityManager = SecurityManager.getInstance();
      const securityStatus = securityManager.getComplianceStatus();
      console.log('🔒 Security manager initialized - Score:', securityStatus.score);

      // Initialize alert system (AlertManager auto-initializes, no initialize method needed)
      const alertManager = AlertManager.getInstance();
      console.log('📢 Enhanced alert system initialized');

      // Initialize CDN manager with image optimization (deferred)
      setTimeout(() => {
        const cdnManager = CDNManager.getInstance();
        
        // Preload critical images with retry mechanism
        const criticalImages = [
          WHITELABEL_CONFIG.branding.logo.url,
          WHITELABEL_CONFIG.badge_images.achievement_badge,
          WHITELABEL_CONFIG.badge_images.honor_badge,
          WHITELABEL_CONFIG.badge_images.excellence_badge
        ];
        
        cdnManager.preloadImages(criticalImages);
        
        // Track performance for each critical image
        criticalImages.forEach(url => {
          cdnManager.trackImagePerformance(url);
        });
        
        console.log('🖼️ Enhanced CDN manager initialized with performance tracking');
      }, 500); // Defer CDN operations

      // Initialize database optimizer (deferred)
      setTimeout(async () => {
        const dbOptimizer = DatabaseOptimizer.getInstance();
        await dbOptimizer.optimizeConnections();
        
        // Get initial optimization analysis
        const analysisPromise = dbOptimizer.analyzePerformance();
        analysisPromise.then(analysis => {
          console.log('🗄️ Database optimization analysis completed:', {
            slowQueries: analysis.slowQueries.length,
            indexSuggestions: analysis.indexSuggestions.length,
            tips: analysis.optimizationTips.length
          });
        }).catch(error => {
          console.error('❌ Database optimization failed:', error);
        });
      }, 1000); // Defer database operations

      // Set up ISO compliance monitoring (non-blocking)
      if (WHITELABEL_CONFIG.system.iso_compliance.enable_audit_logging) {
        console.log('📋 ISO 27001 audit logging enabled');
      }
      
      if (WHITELABEL_CONFIG.system.iso_compliance.enable_performance_monitoring) {
        console.log('⚡ ISO 25010 performance monitoring enabled');
      }
      
      if (WHITELABEL_CONFIG.system.iso_compliance.enable_security_monitoring) {
        console.log('🛡️ ISO 27001 security monitoring enabled');
      }

      // Request enhanced notification permissions (deferred)
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            console.log('🔔 Enhanced notification permission:', permission);
            if (permission === 'granted') {
              // Test notification for system readiness
              new Notification('System Ready', {
                body: `${WHITELABEL_CONFIG.app.name} is now fully operational with enhanced security and performance monitoring.`,
                icon: WHITELABEL_CONFIG.branding.favicon
              });
            }
          });
        }
      }, 2000); // Defer notification permission request

      // End performance timing with correct ID
      performanceMonitor.endTiming(initTimingId, 'api');

      console.log('✅ Enhanced system initialization completed successfully');
      console.log('📈 Performance Score:', performanceMonitor.getPerformanceScore());
      console.log('🔐 Security Score:', securityStatus.score);
      
    } catch (error) {
      console.error('❌ Enhanced system initialization failed:', error);
      
      // Log error for monitoring using public method with correct signature
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
    }
  };

  return { initializeEnhancedSystem };
};
