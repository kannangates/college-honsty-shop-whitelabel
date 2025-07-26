import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to error tracking service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="mb-4 text-muted-foreground">
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </p>
            {import.meta.env.DEV && (
              <details className="mb-4 overflow-auto rounded-md bg-muted/50 p-3 text-sm">
                <summary className="mb-2 cursor-pointer font-medium">Error Details</summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error?.toString()}
                </pre>
                <div className="mt-2 text-xs text-muted-foreground">
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={this.handleReset}>
                Back to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
