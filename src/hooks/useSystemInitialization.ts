
// Enhanced system initialization hook
import { useEffect } from 'react';
import { EnhancedSessionManager } from '@/utils/enhancedSessionManager';
import { AlertManager } from '@/utils/alertManager';
import { CDNManager } from '@/utils/cdnManager';
import { DatabaseOptimizer } from '@/utils/databaseOptimizer';
import { PerformanceMonitor } from '@/utils/performanceMonitoring';
import { SecurityManager } from '@/utils/securityManager';
import { CONFIG } from '@/config';

export const useSystemInitialization = () => {
  useEffect(() => {
    initializeEnhancedSystem();
  }, []);

  const initializeEnhancedSystem = async () => {
    console.log('🚀 Initializing enhanced system with ISO compliance...');

    try {
      // Initialize performance monitoring first
      const performanceMonitor = PerformanceMonitor.getInstance();
      const initTimingId = performanceMonitor.startTiming('system_initialization');
      console.log('📊 Performance monitoring initialized');

      // Initialize enhanced session management
      const sessionManager = EnhancedSessionManager.getInstance();
      await sessionManager.initializeSession();
      console.log('✅ Enhanced session management initialized');

      // Initialize security manager
      const securityManager = SecurityManager.getInstance();
      const securityStatus = securityManager.getComplianceStatus();
      console.log('🔒 Security manager initialized - Score:', securityStatus.score);

      // Initialize alert system (AlertManager auto-initializes, no initialize method needed)
      const alertManager = AlertManager.getInstance();
      console.log('📢 Enhanced alert system initialized');

      // Initialize CDN manager with image optimization
      const cdnManager = CDNManager.getInstance();
      
      // Preload critical images with retry mechanism
      const criticalImages = [
        CONFIG.IMAGES.COLLEGE_LOGO,
        CONFIG.IMAGES.BADGE_IMAGES.ACHIEVEMENT_BADGE,
        CONFIG.IMAGES.BADGE_IMAGES.HONOR_BADGE,
        CONFIG.IMAGES.BADGE_IMAGES.EXCELLENCE_BADGE
      ];
      
      cdnManager.preloadImages(criticalImages);
      
      // Track performance for each critical image
      criticalImages.forEach(url => {
        cdnManager.trackImagePerformance(url);
      });
      
      console.log('🖼️ Enhanced CDN manager initialized with performance tracking');

      // Initialize database optimizer
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
      });

      // Set up ISO compliance monitoring
      if (CONFIG.SYSTEM.ISO_COMPLIANCE.ENABLE_AUDIT_LOGGING) {
        console.log('📋 ISO 27001 audit logging enabled');
      }
      
      if (CONFIG.SYSTEM.ISO_COMPLIANCE.ENABLE_PERFORMANCE_MONITORING) {
        console.log('⚡ ISO 25010 performance monitoring enabled');
      }
      
      if (CONFIG.SYSTEM.ISO_COMPLIANCE.ENABLE_SECURITY_MONITORING) {
        console.log('🛡️ ISO 27001 security monitoring enabled');
      }

      // Request enhanced notification permissions
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 Enhanced notification permission:', permission);
          if (permission === 'granted') {
            // Test notification for system readiness
            new Notification('System Ready', {
              body: `${CONFIG.APP.NAME} is now fully operational with enhanced security and performance monitoring.`,
              icon: CONFIG.IMAGES.FAVICON
            });
          }
        });
      }

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
