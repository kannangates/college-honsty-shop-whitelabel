
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
    }, 3000); // Reduced from 8 seconds to 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  // Store the intended destination for redirect after login
  useEffect(() => {
    if (!user && !loading && location.pathname !== '/auth') {
      localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [user, loading, location]);

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
