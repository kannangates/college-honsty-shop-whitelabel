
// ISO 9001 - Quality Management
export interface QualityMetric {
  component: string;
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  timestamp: number;
}

export class QualityManager {
  private static instance: QualityManager;
  private metrics: QualityMetric[] = [];
  private errorCounts: Map<string, number> = new Map();

  static getInstance(): QualityManager {
    if (!QualityManager.instance) {
      QualityManager.instance = new QualityManager();
    }
    return QualityManager.instance;
  }

  recordError(component: string, error: Error, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    const key = `${component}-${error.name}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);

    console.error(`Quality Error in ${component}:`, {
      error: error.message,
      stack: error.stack,
      severity,
      count: currentCount + 1
    });
  }

  validateDataIntegrity<T>(data: T, schema: Record<string, { required?: boolean; type?: string }>): boolean {
    try {
      // Basic validation - in a real app, use a library like Zod
      for (const [key, validator] of Object.entries(schema)) {
        if (validator.required && !data[key as keyof T]) {
          return false;
        }
        if (data[key as keyof T] && validator.type) {
          const actualType = typeof data[key as keyof T];
          if (actualType !== validator.type) {
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      this.recordError('DataValidation', error as Error, 'medium');
      return false;
    }
  }

  recordMetric(component: string, metric: string, value: number, threshold: number): void {
    const status: QualityMetric['status'] = 
      value > threshold * 1.5 ? 'fail' :
      value > threshold ? 'warning' : 'pass';

    const qualityMetric: QualityMetric = {
      component,
      metric,
      value,
      threshold,
      status,
      timestamp: Date.now()
    };

    this.metrics.push(qualityMetric);

    if (status === 'fail') {
      console.warn(`Quality metric failed: ${component}.${metric} = ${value} (threshold: ${threshold})`);
    }

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getQualityScore(): number {
    if (this.metrics.length === 0) return 95; // Default high score
    
    const passedMetrics = this.metrics.filter(m => m.status === 'pass');
    const score = (passedMetrics.length / this.metrics.length) * 100;
    
    return Math.round(score);
  }

  getQualityReport(): {
    totalErrors: number;
    errorsByComponent: Record<string, number>;
    failedMetrics: QualityMetric[];
    overallScore: number;
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const errorsByComponent: Record<string, number> = {};
    
    for (const [key, count] of this.errorCounts.entries()) {
      const component = key.split('-')[0];
      errorsByComponent[component] = (errorsByComponent[component] || 0) + count;
    }

    const failedMetrics = this.metrics.filter(m => m.status === 'fail');
    const passedMetrics = this.metrics.filter(m => m.status === 'pass');
    const overallScore = this.metrics.length > 0 ? (passedMetrics.length / this.metrics.length) * 100 : 100;

    return {
      totalErrors,
      errorsByComponent,
      failedMetrics,
      overallScore
    };
  }
}
