import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useState } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const N8N_GMAIL_WEBHOOK_URL = import.meta.env.VITE_N8N_GMAIL_WEBHOOK_URL || '';

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('❌ Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    // You can also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Use a function component for hooks
      return <ErrorBoundaryFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorBoundaryFallback({ error }: { error?: Error }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReport = async () => {
    setSending(true);
    setErrorMsg(null);
    setSent(false);
    try {
      const payload = {
        subject: 'User Error Report - College Honesty Shop',
        errorMessage: error?.message || 'Unknown error',
        errorStack: error?.stack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      await fetch(N8N_GMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSent(true);
    } catch (err) {
      setErrorMsg('Failed to send report. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          <p className="mt-2 text-sm text-gray-500">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          {error && (
            <div className="mt-4 text-left bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800 overflow-x-auto">
              <div><strong>Error:</strong> {error.message}</div>
              {error.stack && <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>}
            </div>
          )}
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
            <button
              onClick={handleReport}
              disabled={sending || sent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60"
            >
              {sending ? 'Reporting...' : sent ? 'Reported!' : 'Report Issue'}
            </button>
          </div>
          {errorMsg && <div className="mt-2 text-xs text-red-600">{errorMsg}</div>}
          {sent && <div className="mt-2 text-xs text-green-600">Thank you! The issue has been reported.</div>}
        </div>
      </div>
    </div>
  );
}
