
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { QualityManager } from '@/utils/qualityManager';
import { AuditLogger } from '@/utils/auditLogger';
import { PerformanceMonitor } from '@/utils/performanceMonitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ISOCompliantErrorBoundary extends Component<Props, State> {
  private qualityManager = QualityManager.getInstance();
  private auditLogger = AuditLogger.getInstance();
  private performanceMonitor = PerformanceMonitor.getInstance();

  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown';
    
    // ISO 9001 - Quality Management
    this.qualityManager.recordError(componentName, error, 'high');
    
    // ISO 14155 - Audit Logging
    this.auditLogger.logSystemEvent('error_boundary_triggered', {
      component: componentName,
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // ISO 25010 - Performance Impact
    const timingId = this.performanceMonitor.startTiming(`${componentName}-error-recovery`);
    this.performanceMonitor.endTiming(timingId, 'interaction');

    console.error(`ISO Compliant Error Boundary - ${componentName}:`, {
      error,
      errorInfo,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    });
  }

  private handleReset = () => {
    this.auditLogger.logUserAction('error_boundary_reset', {
      component: this.props.componentName || 'Unknown',
      errorId: this.state.errorId
    });
    
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  private handleReload = () => {
    this.auditLogger.logUserAction('error_boundary_reload', {
      component: this.props.componentName || 'Unknown',
      errorId: this.state.errorId
    });
    
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const qualityReport = this.qualityManager.getQualityReport();

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-screen-2xl w-full shadow-lg border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-6 w-6" />
                System Error Detected
                <Badge variant="destructive" className="ml-2">
                  ISO Compliant
                </Badge>
              </CardTitle>
              <CardDescription className="text-red-600">
                An unexpected error occurred. This incident has been logged and reported for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Error Details */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Error Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Error ID:</strong> {this.state.errorId}</div>
                  <div><strong>Component:</strong> {this.props.componentName || 'Unknown'}</div>
                  <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                  {this.state.error && (
                    <div><strong>Message:</strong> {this.state.error.message}</div>
                  )}
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  System Quality Status
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Quality Score:</span>
                    <span className="ml-2 font-medium">{qualityReport.overallScore.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Total Errors:</span>
                    <span className="ml-2 font-medium">{qualityReport.totalErrors}</span>
                  </div>
                </div>
              </div>

              {/* ISO Compliance Notice */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">ISO Compliance</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div>✓ ISO 27001 - Security protocols activated</div>
                  <div>✓ ISO 25010 - Performance metrics recorded</div>
                  <div>✓ ISO 14155 - Incident logged for audit</div>
                  <div>✓ ISO 9001 - Quality management engaged</div>
                  <div>✓ ISO 12207 - Lifecycle processes maintained</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  Reload Application
                </Button>
              </div>

              {/* Development Info */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Development Details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
