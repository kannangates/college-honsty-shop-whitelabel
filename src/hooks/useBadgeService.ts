import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type BadgeRow = Tables<'badges'>;
type UserBadgeRow = Tables<'user_badges'>;

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  min_points: number;
  badge_type: 'tier' | 'achievement';
  is_active: boolean;
  created_at: string;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

interface BadgeProgress {
  currentTier: Badge | null;
  nextTier: Badge | null;
  progress: number;
  earnedBadges: UserBadge[];
  totalBadges: number;
}

interface IndividualBadgeProgress {
  badgeId: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  progressPercentage: number;
}

export const useBadgeService = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<Record<string, IndividualBadgeProgress>>({});
  const [overallProgress, setOverallProgress] = useState<BadgeProgress>({
    currentTier: null,
    nextTier: null,
    progress: 0,
    earnedBadges: [],
    totalBadges: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch all badges
  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('min_points', { ascending: true });

      if (error) throw error;
      
      // Cast to proper Badge type
      const typedBadges: Badge[] = (data || []).map(badge => ({
        ...badge,
        badge_type: badge.badge_type as 'tier' | 'achievement'
      }));
      
      setBadges(typedBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchUserBadges = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      const transformedData = (data || []).map(item => ({
        ...item,
        badge: item.badges as Badge
      }));
      setUserBadges(transformedData);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  }, [user?.id]);

  const calculateProgress = useCallback(async () => {
    if (!profile?.id || !badges.length) return;

    const progressData: Record<string, IndividualBadgeProgress> = {};

    for (const badge of badges) {
      try {
        let progress = 0;
        const target = badge.min_points;

        // Calculate progress based on badge type
        switch (badge.badge_type) {
          case 'tier':
            progress = profile.points || 0;
            break;
          case 'achievement':
            // Simple achievement progress calculation
            progress = profile.points || 0;
            break;
          default:
            progress = profile.points || 0;
        }

        progressData[badge.id] = {
          badgeId: badge.id,
          currentProgress: progress,
          targetProgress: target,
          isCompleted: progress >= target,
          progressPercentage: Math.min((progress / target) * 100, 100)
        };
      } catch (error) {
        console.error(`Error calculating progress for badge ${badge.id}:`, error);
      }
    }

    setBadgeProgress(progressData);
  }, [profile?.id, profile?.points, badges]);

  // Award badges for user
  const awardBadgesForUser = async (orderId?: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.functions.invoke('award-badges', {
        body: { userId: user.id, orderId }
      });

      if (error) throw error;

      if (data?.newBadges?.length > 0) {
        // Show toast for new badges
        data.newBadges.forEach((badgeName: string) => {
          toast({
            title: '🏆 Badge Unlocked!',
            description: `You've earned the "${badgeName}" badge!`,
            duration: 5000,
          });
        });

        // Refresh badge data
        await fetchUserBadges();
      }

      return data;
    } catch (error) {
      console.error('Error awarding badges:', error);
      throw error;
    }
  };

  // Check if user has specific badge
  const hasBadge = (badgeName: string): boolean => {
    return userBadges.some(ub => ub.badge?.name === badgeName);
  };

  // Get badges by type
  const getBadgesByType = (type: 'tier' | 'achievement'): Badge[] => {
    return badges.filter(b => b.badge_type === type);
  };

  // Initialize data
  useEffect(() => {
    const initializeBadgeData = async () => {
      setLoading(true);
      await fetchBadges();
      await fetchUserBadges();
      setLoading(false);
    };

    initializeBadgeData();
  }, [user?.id, fetchUserBadges]);

  // Calculate progress when data changes
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  useEffect(() => {
    fetchUserBadges();
  }, [fetchUserBadges]);

  return {
    badges,
    userBadges,
    badgeProgress: overallProgress,
    loading,
    awardBadgesForUser,
    hasBadge,
    getBadgesByType,
    fetchUserBadges,
    fetchBadges: fetchBadges,
    fetchAllBadges: fetchBadges,
    fetchUserProgress: fetchUserBadges
  };
};
