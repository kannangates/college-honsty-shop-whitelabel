
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopDepartment {
  department: string;
  points: number;
  rank: number;
}

export const useTopDepartments = () => {
  return useQuery({
    queryKey: ['top-departments'],
    queryFn: async (): Promise<TopDepartment[]> => {
      console.log('🏢 Fetching top departments');
      const { data, error } = await supabase
        .from('top_departments')
        .select('department, points, rank')
        .eq('is_archived', false)
        .order('rank', { ascending: true })
        .limit(3);
      if (error) {
        console.error('Top departments error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
