
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

export const useBadgeService = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress>({
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

  // Fetch user badges
  const fetchUserBadges = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          user_id,
          badge_id,
          earned_at,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      
      // Cast to proper UserBadge type
      const typedUserBadges: UserBadge[] = (data || []).map(userBadge => ({
        ...userBadge,
        badge: {
          ...userBadge.badge,
          badge_type: userBadge.badge.badge_type as 'tier' | 'achievement'
        }
      }));
      
      setUserBadges(typedUserBadges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  };

  // Calculate badge progress
  const calculateProgress = () => {
    if (!profile?.points || badges.length === 0) return;

    const tierBadges = badges
      .filter(b => b.badge_type === 'tier')
      .sort((a, b) => a.min_points - b.min_points);

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    const earnedTierBadges = tierBadges.filter(b => b.min_points <= profile.points);
    const currentTier = earnedTierBadges[earnedTierBadges.length - 1] || null;
    const nextTier = tierBadges.find(b => b.min_points > profile.points) || null;

    let progress = 0;
    if (nextTier && currentTier) {
      const pointsInCurrentTier = profile.points - currentTier.min_points;
      const pointsNeededForNext = nextTier.min_points - currentTier.min_points;
      progress = Math.round((pointsInCurrentTier / pointsNeededForNext) * 100);
    } else if (nextTier && !currentTier) {
      progress = Math.round((profile.points / nextTier.min_points) * 100);
    } else {
      progress = 100; // Max tier reached
    }

    setBadgeProgress({
      currentTier,
      nextTier,
      progress: Math.min(progress, 100),
      earnedBadges: userBadges,
      totalBadges: badges.length
    });
  };

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
  }, [user?.id]);

  // Calculate progress when data changes
  useEffect(() => {
    calculateProgress();
  }, [badges, userBadges, profile?.points]);

  return {
    badges,
    userBadges,
    badgeProgress,
    loading,
    awardBadgesForUser,
    hasBadge,
    getBadgesByType,
    fetchUserBadges,
    fetchBadges
  };
};
