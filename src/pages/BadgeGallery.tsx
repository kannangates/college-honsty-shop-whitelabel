import React, { useState, useEffect, useCallback } from 'react';
import { useBadgeService } from '@/features/gamification/hooks/useBadgeService';
import { useAuth } from '@/contexts/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const BadgeGallery = () => {
  const { user } = useAuth();
  const { badges, badgeProgress, fetchAllBadges, fetchUserProgress, loading } = useBadgeService();
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);

  const loadBadgesAndProgress = useCallback(async () => {
    try {
      await Promise.all([
        fetchAllBadges(),
        fetchUserProgress()
      ]);
    } catch (error) {
      console.error('Error loading badges and progress:', error);
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
      <div className="w-full py-12">
        <LoadingSpinner text="Loading your badges..." />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badge Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map(badge => (
            <div
              key={badge.id}
              className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleBadgeClick(badge.id)}
            >
              <h3 className="font-semibold">{badge.name}</h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                Minimum Points: {badge.min_points}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeGallery;
