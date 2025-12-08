import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useBadgeService = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({
    currentTier: null,
    nextTier: null,
    progress: 0,
    earnedBadges: [],
    totalBadges: 0
  });
  const [overallProgress, setOverallProgress] = useState({
    currentTier: null,
    nextTier: null,
    progress: 0,
    earnedBadges: [],
    totalBadges: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAllBadges = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('min_points', { ascending: true });

      if (error) throw error;

      setBadges(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load badges',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUserProgress = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user's earned badges
      const { data: userBadgesData, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id, badges(*)')
        .eq('user_id', user.id);

      if (userBadgesError) throw userBadgesError;

      setUserBadges(userBadgesData || []);

      // Fetch all badges to calculate progress
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true);

      if (badgesError) throw badgesError;

      const earnedBadgeIds = userBadgesData?.map(ub => ub.badge_id) || [];
      const totalBadges = allBadges?.length || 0;
      const earnedCount = earnedBadgeIds.length;
      const progress = totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0;

      // Get current user points from profile
      const userPoints = profile?.points || 0;

      // Find current and next tier based on points
      const sortedBadges = (allBadges || []).sort((a, b) => a.min_points - b.min_points);
      let currentTier = null;
      let nextTier = null;

      for (let i = 0; i < sortedBadges.length; i++) {
        if (userPoints >= sortedBadges[i].min_points) {
          currentTier = sortedBadges[i];
        } else {
          nextTier = sortedBadges[i];
          break;
        }
      }

      const progressData = {
        currentTier,
        nextTier,
        progress,
        earnedBadges: earnedBadgeIds,
        totalBadges,
      };

      setBadgeProgress(progressData);
      setOverallProgress(progressData);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load badge progress',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile, toast]);

  const awardBadgesForUser = useCallback(async (orderId: string) => {
    // Award badges implementation
    console.log('Awarding badges for order:', orderId);
  }, []);

  return {
    badges,
    userBadges,
    badgeProgress,
    overallProgress,
    loading,
    fetchAllBadges,
    fetchUserProgress,
    awardBadgesForUser,
  };
}; 