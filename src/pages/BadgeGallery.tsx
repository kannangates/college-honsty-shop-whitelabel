import React, { useState, useEffect, useCallback } from 'react';
import { useBadgeService } from '@/hooks/useBadgeService';
import { useAuth } from '@/hooks/useAuth';
import { BadgeCard } from '@/components/badge/BadgeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const BadgeGallery = () => {
  const { user } = useAuth();
  const { badges, badgeProgress, fetchAllBadges, fetchUserProgress, loading } = useBadgeService();
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);

  const loadBadgesAndProgress = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllBadges(),
        fetchUserProgress()
      ]);
    } catch (error) {
      console.error('Error loading badges and progress:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchAllBadges, fetchUserProgress]);

  useEffect(() => {
    loadBadgesAndProgress();
  }, [loadBadgesAndProgress]);

  const handleBadgeClick = (badgeId: string) => {
    setExpandedBadge(prev => (prev === badgeId ? null : badgeId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading badges...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badge Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              progress={badgeProgress[badge.id]}
              isExpanded={expandedBadge === badge.id}
              onClick={() => handleBadgeClick(badge.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeGallery;
