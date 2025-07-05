
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopStudent {
  student_id: string;
  name: string;
  department: string;
  points: number;
  rank: number;
}

export const useTopStudents = () => {
  return useQuery({
    queryKey: ['top-students'],
    queryFn: async (): Promise<TopStudent[]> => {
      console.log('🏆 Fetching top students');
      const { data, error } = await supabase
        .from('top_students')
        .select('student_id, name, department, points, rank')
        .eq('is_archived', false)
        .order('rank', { ascending: true })
        .limit(10);
      if (error) {
        console.error('Top students error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
