
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';
import { useDashboardStats } from './dashboard/useDashboardStats';
import { useTopStudents } from './dashboard/useTopStudents';
import { useTopDepartments } from './dashboard/useTopDepartments';

export interface Product {
  product_name: string;
  total_quantity: number;
  paid_quantity: number;
  unpaid_quantity: number;
  paid_amount: number;
  unpaid_amount: number;
}

interface DashboardData {
  stats: {
    todayOrders: number;
    revenue: number;
    pendingOrders: number;
    lowStockItems: number;
    topDepartments: Array<{
      department: string;
      points: number;
      rank: number;
    }>;
  };
  topStudents: Array<{
    student_id: string;
    name: string;
    department: string;
    points: number;
    rank: number;
  }>;
  userRank: number;
  stockData: Array<{
    id: string;
    name: string;
    quantity: number;
    threshold: number;
  }>;
}

interface PositionContextStudent {
  student_id: string;
  name: string;
  department: string;
  points: number;
  rank: number;
  isCurrentUser: boolean;
}

export const useDashboardData = () => {
  const { profile, isAdmin } = useAuth();

  // Use focused hooks
  const { data: todaysStats, error: statsError } = useDashboardStats(isAdmin);
  const { data: topStudents, error: studentsError } = useTopStudents();
  const { data: topDepartments, error: departmentsError } = useTopDepartments();

  // Basic dashboard/stat data with optimized query
  const { data: dashboardData, error: dashboardError } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      console.log('📊 Fetching dashboard data');
      const { data, error } = await supabase.functions.invoke('dashboard-data');
      if (error) {
        console.error('Dashboard data error:', error);
        throw error;
      }
      return data as DashboardData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });

  // Optimized position context query
  const { data: positionContext, error: positionError } = useQuery({
    queryKey: ['user-position-context', profile?.student_id],
    queryFn: async (): Promise<PositionContextStudent[] | null> => {
      if (!profile?.student_id) return null;
      console.log('📍 Fetching user position context');
      
      const { data: allStudents, error } = await supabase
        .from('users')
        .select('student_id, name, department, points')
        .eq('role', 'student')
        .eq('status', 'active')
        .order('points', { ascending: false });
        
      if (error) {
        console.error('Position context error:', error);
        throw error;
      }
      
      const userIndex = allStudents?.findIndex(s => s.student_id === profile.student_id);
      if (userIndex === -1 || userIndex === undefined) return null;
      
      const start = Math.max(0, userIndex - 5);
      const end = Math.min(allStudents.length, userIndex + 5);
      
      return allStudents.slice(start, end).map((student, idx) => ({
        ...student,
        rank: start + idx + 1,
        isCurrentUser: student.student_id === profile.student_id
      }));
    },
    enabled: !!profile?.student_id,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  });

  // Memoized today's products parsing with error handling
  const todaysProducts: Product[] = React.useMemo(() => {
    if (!todaysStats?.todays_sold_products) return [];
    
    try {
      const raw = todaysStats.todays_sold_products;
      let parsed: unknown = raw;
      
      if (typeof raw === "string") {
        parsed = JSON.parse(raw);
      }
      
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is Product => (
          typeof item === "object" && item !== null &&
          typeof item.product_name === "string" &&
          typeof item.total_quantity === "number" &&
          typeof item.paid_quantity === "number" &&
          typeof item.unpaid_quantity === "number" &&
          typeof item.paid_amount === "number" &&
          typeof item.unpaid_amount === "number"
        ));
      }
      
      if (
        typeof parsed === "object" && parsed !== null &&
        typeof (parsed as Record<string, unknown>).product_name === "string"
      ) {
        const prod = parsed as Product;
        if (
          typeof prod.total_quantity === "number" &&
          typeof prod.paid_quantity === "number" &&
          typeof prod.unpaid_quantity === "number" &&
          typeof prod.paid_amount === "number" &&
          typeof prod.unpaid_amount === "number"
        ) {
          return [prod];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing today\'s products:', error);
      return [];
    }
  }, [todaysStats?.todays_sold_products]);

  // Log any errors for debugging
  React.useEffect(() => {
    const errors = [dashboardError, statsError, studentsError, departmentsError, positionError].filter(Boolean);
    if (errors.length > 0) {
      console.error('Dashboard data errors:', errors);
    }
  }, [dashboardError, statsError, studentsError, departmentsError, positionError]);

  return {
    dashboardData,
    todaysStats,
    topStudents: topStudents || [],
    topDepartments: topDepartments || [],
    positionContext: positionContext || [],
    todaysProducts,
    errors: {
      dashboardError,
      statsError,
      studentsError,
      departmentsError,
      positionError
    }
  };
};
