import React from 'react';
import { Badge } from '@/features/gamification/components/badge';
import { useBadgeService } from '@/features/gamification/hooks/useBadgeService';
import { useAuth } from '@/contexts/useAuth';

export const BadgeDisplay = () => {
  const { profile } = useAuth();
  const { badgeProgress } = useBadgeService();

  if (!profile || !badgeProgress.currentTier) {
    return null;
  }

  const getBadgeIcon = (badgeName: string) => {
    if (badgeName.includes('🎓')) return '🎓';
    if (badgeName.includes('🧰')) return '🧰';
    if (badgeName.includes('✨')) return '✨';
    if (badgeName.includes('🛡️')) return '🛡️';
    if (badgeName.includes('🔮')) return '🔮';
    if (badgeName.includes('🐉')) return '🐉';
    return '🏅';
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
      >
        <span className="mr-1">{getBadgeIcon(badgeProgress.currentTier.name)}</span>
        {badgeProgress.currentTier.name}
      </Badge>
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <span>{profile.points} pts</span>
      </div>
    </div>
  );
}; 