import React, { useState, useEffect, useCallback } from 'react';
import { useBadgeService } from '@/features/gamification/hooks/useBadgeService';
import { useAuth } from '@/contexts/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Construction, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const BadgeGallery = () => {
  const { user } = useAuth();
  const { badges, badgeProgress, userBadges, fetchAllBadges, fetchUserProgress, loading } = useBadgeService();
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

  const earnedBadgeIds = badgeProgress.earnedBadges || [];

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 relative">
      {/* Coming Soon Overlay with Glass Effect */}
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-xl max-w-sm mx-4">
          <div className="flex items-center justify-center mb-3">
            <Construction className="h-6 w-6 text-gray-700 mr-2 animate-bounce" />
            <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Badges Coming Soon! ✨
          </h3>
          <p className="text-gray-700 text-sm font-medium mb-2">
            We're building something amazing! 🚀
          </p>
          <p className="text-gray-600 text-xs">
            Achievement system and rewards are on the way!
          </p>
          <div className="mt-3 flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>

      {/* Blurred Content */}
      <div className="blur-sm pointer-events-none">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Badge Gallery
            </CardTitle>
            {badges.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                You've earned {earnedBadgeIds.length} of {badges.length} badges
              </p>
            )}
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No badges available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {badges.map(badge => {
                  const isEarned = earnedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${isEarned
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                        : 'opacity-60 grayscale'
                        }`}
                      onClick={() => handleBadgeClick(badge.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{badge.name}</h3>
                        {isEarned && <Trophy className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Minimum Points: {badge.min_points}
                      </div>
                      {isEarned && (
                        <div className="mt-2 text-xs font-semibold text-yellow-700">
                          ✓ Earned
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BadgeGallery;
