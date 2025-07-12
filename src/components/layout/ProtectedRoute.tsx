
import React, { useEffect, useState } from "react";
import { useAuth } from '@/contexts/useAuth';
import { useLocation, Navigate } from "react-router-dom";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Reduced timeout for better user experience
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ ProtectedRoute loading timeout reached');
      setTimeoutReached(true);
    }, 1000); // Reduced from 1500ms to 1000ms for faster UX

    return () => clearTimeout(timeout);
  }, []);

  // No longer store redirect URL - users will always go to dashboard after login
  // This prevents role mismatch issues when users visit admin pages while logged out

  // If timeout reached and still loading, force navigation to auth
  if (timeoutReached && loading) {
    console.warn('🔄 Forcing redirect to auth due to timeout');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (loading && !timeoutReached) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!user) {
    // Redirect to /auth but keep location to allow redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
