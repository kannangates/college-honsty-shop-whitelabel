import React, { Suspense, lazy } from 'react';

const TopPointsCelebration = lazy(() => import('../ui/TopPointsCelebration'));
const RankCelebration = lazy(() => import('../ui/RankCelebration'));

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
    <Suspense fallback={null}>
      {showCelebration && (
        <TopPointsCelebration onComplete={onCelebrationComplete} />
      )}
      {showRankCelebration && currentUserRank && (
        <RankCelebration rank={currentUserRank} />
      )}
    </Suspense>
  );
};