import React from "react";
import { toast } from "@/hooks/use-toast";

type State = {
  hasError: boolean;
  error?: Error;
};

interface ErrorInfo {
  componentStack: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Custom logging can go here
    toast({
      title: "Unexpected Error",
      description: error.message,
      variant: "destructive"
    });
    // Optionally log info to monitoring
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-2xl font-bold text-red-600 mb-2">Something went wrong</div>
          <div className="text-gray-500">{this.state.error?.message || "Unknown error."}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
