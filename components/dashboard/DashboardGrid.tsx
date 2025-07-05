
import React from 'react';
import RankingsSection from './RankingsSection';
import GameStyleUserCard from '../ui/GameStyleUserCard';

interface RankingItem {
  id: string;
  name: string;
  department: string;
  points: number;
  rank: number;
}

interface User {
  student_id?: string;
  name?: string;
  points?: number;
}

interface DashboardGridProps {
  transformedStudents: RankingItem[];
  transformedDepartments: RankingItem[];
  profile: User | null;
  currentUserRank: number | undefined;
  onCelebration: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  transformedStudents,
  transformedDepartments,
  profile,
  currentUserRank,
  onCelebration
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Student Rankings Only */}
      <div className="min-h-[600px]">
        <RankingsSection
          topStudents={transformedStudents}
          topDepartments={transformedDepartments}
          currentUserId={profile?.student_id}
          singleColumn={true}
        />
      </div>
      
      {/* Right Column: User Profile Card */}
      <div className="min-h-[600px]">
        <GameStyleUserCard
          user={profile}
          rank={currentUserRank}
          onCelebration={onCelebration}
        />
      </div>
    </div>
  );
};
