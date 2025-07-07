
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'loading' | 'interaction' | 'rendering' | 'network';
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageLoadTime: number;
    criticalIssues: number;
  };
  recommendations: string[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    this.recordNavigationMetrics();
    
    // Monitor resource timing
    this.recordResourceMetrics();
    
    // Monitor largest contentful paint
    this.observeLCP();
    
    // Monitor first input delay
    this.observeFID();
    
    // Monitor cumulative layout shift
    this.observeCLS();
  }

  private recordNavigationMetrics(): void {
    if (!performance.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.addMetric('DOM Content Loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'loading');
      this.addMetric('Load Complete', navigation.loadEventEnd - navigation.loadEventStart, 'loading');
      this.addMetric('Page Load Time', navigation.loadEventEnd - navigation.fetchStart, 'loading');
    }
  }

  private recordResourceMetrics(): void {
    if (!performance.getEntriesByType) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    resources.forEach(resource => {
      if (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') {
        this.addMetric(`Network: ${resource.name}`, resource.responseEnd - resource.requestStart, 'network');
      }
    });
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.addMetric('Largest Contentful Paint', lastEntry.startTime, 'rendering');
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          this.addMetric('First Input Delay', entry.processingStart - entry.startTime, 'interaction');
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];
        entries.forEach(entry => {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as PerformanceEntry & { value: number }).value;
          }
        });
        this.addMetric('Cumulative Layout Shift', clsValue, 'rendering');
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }

  addMetric(name: string, value: number, category: PerformanceMetric['category']): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      category
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  generateReport(): PerformanceReport {
    const totalMetrics = this.metrics.length;
    const loadingMetrics = this.metrics.filter(m => m.category === 'loading');
    const averageLoadTime = loadingMetrics.length > 0 
      ? loadingMetrics.reduce((sum, m) => sum + m.value, 0) / loadingMetrics.length 
      : 0;
    
    const criticalIssues = this.metrics.filter(m => 
      (m.name.includes('Load') && m.value > 3000) ||
      (m.name.includes('Paint') && m.value > 2500) ||
      (m.name.includes('Delay') && m.value > 100)
    ).length;

    const recommendations: string[] = [];
    if (averageLoadTime > 3000) {
      recommendations.push('Consider optimizing resource loading and reducing bundle size');
    }
    if (criticalIssues > 0) {
      recommendations.push('Address critical performance issues for better user experience');
    }

    return {
      metrics: this.getMetrics(),
      summary: {
        totalMetrics,
        averageLoadTime,
        criticalIssues
      },
      recommendations
    };
  }

  // Method to handle any type of performance data
  recordCustomMetric(data: Record<string, unknown>): void {
    try {
      if (typeof data.name === 'string' && typeof data.value === 'number') {
        const category = (data.category as PerformanceMetric['category']) || 'interaction';
        this.addMetric(data.name, data.value, category);
      }
    } catch (error) {
      console.error('Custom metric recording failed:', error);
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}
