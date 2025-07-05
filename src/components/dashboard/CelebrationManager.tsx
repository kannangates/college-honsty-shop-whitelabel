import React from 'react';
import TopPointsCelebration from '../ui/TopPointsCelebration';
import RankCelebration from '../ui/RankCelebration';

interface CelebrationManagerProps {
  showCelebration: boolean;
  showRankCelebration: boolean;
  currentUserRank?: number;
  onCelebrationComplete: () => void;
  onRankCelebrationComplete: () => void;
}

export const CelebrationManager: React.FC<CelebrationManagerProps> = ({
  showCelebration,
  showRankCelebration,
  currentUserRank,
  onCelebrationComplete,
  onRankCelebrationComplete
}) => {
  return (
    <>
      {showCelebration && (
        <TopPointsCelebration onComplete={onCelebrationComplete} />
      )}
      {showRankCelebration && currentUserRank && (
        <RankCelebration rank={currentUserRank} />
      )}
    </>
  );
};