import React, { useEffect, useState } from "react";
import { useAuth } from '@/contexts/useAuth';
import { useLocation, Navigate } from "react-router-dom";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        // Check user_roles table for admin/developer role
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          const userRoles = roles?.map(r => r.role) || [];
          setIsAdmin(userRoles.includes('admin') || userRoles.includes('developer'));
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  // Still loading auth
  if (authLoading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Still checking role
  if (checkingRole) {
    return <LoadingSpinner text="Verifying admin access..." />;
  }

  // Not admin - redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
