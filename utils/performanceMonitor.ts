
// Enhanced Performance Monitoring with ISO 25010 compliance
export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface PerformanceThresholds {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  
  private readonly thresholds: PerformanceThresholds = {
    pageLoadTime: 3000, // 3 seconds
    timeToInteractive: 3800, // 3.8 seconds
    firstContentfulPaint: 1800, // 1.8 seconds
    largestContentfulPaint: 2500, // 2.5 seconds
    cumulativeLayoutShift: 0.1, // 0.1
    firstInputDelay: 100 // 100ms
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  initialize(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('Performance monitoring not supported');
      return;
    }

    this.observeWebVitals();
    this.observeUserTiming();
    this.observeResourceTiming();
  }

  private observeWebVitals(): void {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.checkThreshold('largestContentfulPaint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.checkThreshold('firstInputDelay', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
        this.checkThreshold('cumulativeLayoutShift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.error('Error setting up Web Vitals observers:', error);
    }
  }

  private observeUserTiming(): void {
    try {
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log(`📊 User Timing: ${entry.name} - ${entry.duration}ms`);
        });
      });
      userTimingObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(userTimingObserver);
    } catch (error) {
      console.error('Error setting up User Timing observer:', error);
    }
  }

  private observeResourceTiming(): void {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceResourceTiming) => {
          const loadTime = entry.responseEnd - entry.requestStart;
          if (loadTime > 1000) { // Log slow resources
            console.warn(`⚠️ Slow resource: ${entry.name} - ${loadTime.toFixed(2)}ms`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.error('Error setting up Resource Timing observer:', error);
    }
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number): void {
    const threshold = this.thresholds[metric];
    if (value > threshold) {
      console.warn(`⚠️ Performance threshold exceeded for ${metric}: ${value} > ${threshold}`);
    } else {
      console.log(`✅ Performance good for ${metric}: ${value} <= ${threshold}`);
    }
  }

  markStart(name: string): void {
    performance.mark(`${name}-start`);
  }

  markEnd(name: string): void {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (error) {
      console.warn(`Could not measure ${name}:`, error);
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;

    // Calculate score based on thresholds
    Object.entries(metrics).forEach(([key, value]) => {
      const threshold = this.thresholds[key as keyof PerformanceThresholds];
      if (value && threshold) {
        const ratio = value / threshold;
        if (ratio > 1) {
          score -= Math.min(20, (ratio - 1) * 30); // Penalty for exceeding threshold
        }
      }
    });

    return Math.max(0, score);
  }

  generateReport(): {
    score: number;
    metrics: Partial<PerformanceMetrics>;
    recommendations: string[];
  } {
    const score = this.getPerformanceScore();
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      recommendations.push('Optimize images and reduce render-blocking resources');
    }

    if (metrics.firstInputDelay && metrics.firstInputDelay > this.thresholds.firstInputDelay) {
      recommendations.push('Minimize JavaScript execution time');
    }

    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      recommendations.push('Add size attributes to images and reserve space for dynamic content');
    }

    return { score, metrics, recommendations };
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}
