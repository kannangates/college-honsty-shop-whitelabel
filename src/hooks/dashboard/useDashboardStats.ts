
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TodaysStats {
  todays_orders: number;
  todays_paid_orders: number;
  total_revenue: number;
  todays_unique_customers: number;
  todays_sold_products: unknown;
}

export const useDashboardStats = (isAdmin: boolean) => {
  return useQuery({
    queryKey: ['todays-dashboard-stats'],
    queryFn: async (): Promise<TodaysStats | null> => {
      if (!isAdmin) return null;
      console.log('📈 Fetching today\'s stats');
      const { data, error } = await supabase.rpc('get_todays_dashboard_stats');
      if (error) {
        console.error('Today\'s stats error:', error);
        throw error;
      }
      return data?.[0] || null;
    },
    enabled: isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes for admin stats
    gcTime: 5 * 60 * 1000,
  });
};
