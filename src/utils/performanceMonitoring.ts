// ISO 25010 - Software Quality and Performance
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'api' | 'interaction' | 'resource' | 'navigation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface PerformanceThresholds {
  render: number;
  api: number;
  interaction: number;
  resource: number;
  navigation: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  
  private readonly thresholds: PerformanceThresholds = {
    render: 100, // Increased from 50ms to 100ms for more realistic expectations
    api: 3000, // Increased from 2000ms to 3000ms for network operations
    interaction: 300, // Increased from 200ms to 300ms for user interactions
    resource: 5000, // Increased from 3000ms to 5000ms for resource loading
    navigation: 8000 // Increased from 5000ms to 8000ms for page navigation
  };

  private readonly maxMetrics = 1000;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
      PerformanceMonitor.instance.initializeObservers();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page-load', navEntry.loadEventEnd - navEntry.fetchStart, 'navigation', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstPaint: navEntry.domContentLoadedEventEnd - navEntry.fetchStart
              });
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        // Silent fail - no logging needed
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.recordMetric(
                `resource-${resourceEntry.name.split('/').pop()}`,
                resourceEntry.responseEnd - resourceEntry.fetchStart,
                'resource',
                {
                  size: resourceEntry.transferSize,
                  cached: resourceEntry.transferSize === 0,
                  type: resourceEntry.initiatorType
                }
              );
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        // Silent fail - no logging needed
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const lcpTime = entry.startTime;
            // Only log if LCP is truly problematic (>5 seconds)
            if (lcpTime > 5000) {
              this.recordMetric('largest-contentful-paint', lcpTime, 'render', {
                element: (entry as PerformanceEntry & { element?: Element })?.element?.tagName
              });
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        // Silent fail - no logging needed
      }
    }
  }

  startTiming(name: string): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if ('performance' in window && 'mark' in performance) {
      try {
        performance.mark(`${id}-start`);
      } catch (error) {
        // Silent fail - no logging needed
      }
    }
    
    return id;
  }

  endTiming(id: string, type: PerformanceMetric['type'], metadata?: Record<string, unknown>): void {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      try {
        performance.mark(`${id}-end`);
        performance.measure(id, `${id}-start`, `${id}-end`);
        
        const measure = performance.getEntriesByName(id, 'measure')[0];
        if (measure) {
          this.recordMetric(id, measure.duration, type, metadata);
        }
        
        // Clean up marks and measures
        performance.clearMarks(`${id}-start`);
        performance.clearMarks(`${id}-end`);
        performance.clearMeasures(id);
      } catch (error) {
        // Silent fail - no logging needed
      }
    }
  }

  private recordMetric(name: string, duration: number, type: PerformanceMetric['type'], metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      type,
      severity: this.getSeverity(duration, type),
      metadata
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);
    
    // Keep only last N metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private getSeverity(duration: number, type: PerformanceMetric['type']): PerformanceMetric['severity'] {
    const threshold = this.thresholds[type];
    if (duration > threshold * 3) return 'critical';
    if (duration > threshold * 2) return 'high';
    if (duration > threshold) return 'medium';
    return 'low';
  }

  private checkThresholds(metric: PerformanceMetric): void {
    // Only log truly critical performance issues (>30 seconds)
    if (metric.severity === 'critical' && metric.duration > 30000) {
      console.error(`Performance issue: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  getMetrics(type?: PerformanceMetric['type']): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return [...this.metrics];
  }

  getAverageByType(type: PerformanceMetric['type']): number {
    const typeMetrics = this.metrics.filter(m => m.type === type);
    if (typeMetrics.length === 0) return 0;
    return typeMetrics.reduce((sum, m) => sum + m.duration, 0) / typeMetrics.length;
  }

  getPerformanceScore(): number {
    const weights = { render: 0.3, api: 0.3, interaction: 0.2, resource: 0.1, navigation: 0.1 };
    let totalScore = 0;
    let totalWeight = 0;

    for (const [type, weight] of Object.entries(weights)) {
      const average = this.getAverageByType(type as PerformanceMetric['type']);
      const threshold = this.thresholds[type as keyof PerformanceThresholds];
      
      if (average > 0) {
        const score = Math.max(0, 100 - (average / threshold) * 50);
        totalScore += score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 100;
  }

  getSlowQueries(): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.type === 'api' && m.severity !== 'low')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }

  getMemoryUsage(): {
    metricsCount: number;
    estimatedSize: number;
    observersActive: number;
  } {
    return {
      metricsCount: this.metrics.length,
      estimatedSize: this.metrics.length * 200, // Rough estimate in bytes
      observersActive: this.observers.size
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Get Web Vitals
  getWebVitals(): {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  } {
    const vitals: { lcp?: number; fid?: number; cls?: number } = {};
    
    const lcpMetrics = this.metrics.filter(m => m.name === 'largest-contentful-paint');
    if (lcpMetrics.length > 0) {
      vitals.lcp = Math.min(...lcpMetrics.map(m => m.duration));
    }

    const fidMetrics = this.metrics.filter(m => m.type === 'interaction');
    if (fidMetrics.length > 0) {
      vitals.fid = Math.max(...fidMetrics.map(m => m.duration));
    }

    return vitals;
  }

  disconnect(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}
