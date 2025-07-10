
import React, { useState, useCallback, useMemo } from "react";
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import UserPositionCard from './UserPositionCard';
import TodaysSoldProductsTable from '../ui/TodaysSoldProductsTable';
import { DashboardLayout } from './DashboardLayout';
import { DashboardGrid } from './DashboardGrid';
import { CelebrationManager } from './CelebrationManager';
import { ErrorDisplay } from './ErrorDisplay';
import { useAuth } from '@/contexts/useAuth';
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardContent = React.memo(() => {
  const { profile, isAdmin } = useAuth();
  const {
    dashboardData,
    todaysStats,
    topStudents,
    topDepartments,
    positionContext,
    todaysProducts,
    errors
  } = useDashboardData();

  const [showCelebration, setShowCelebration] = useState(false);
  const [showRankCelebration, setShowRankCelebration] = useState(false);

  // Memoize current user rank calculation with proper type checking
  const currentUserRank = useMemo(() => {
    if (!Array.isArray(topStudents) || !profile?.student_id) return undefined;
    return topStudents.find(student => student.student_id === profile.student_id)?.rank;
  }, [topStudents, profile?.student_id]);

  // Memoize celebration handler
  const handleCelebration = useCallback(() => {
    if (currentUserRank && currentUserRank <= 3) {
      setShowRankCelebration(true);
    } else {
      setShowCelebration(true);
    }
  }, [currentUserRank]);

  // Transform topStudents to match RankingItem interface
  const transformedStudents = useMemo(() => {
    return (topStudents || []).map(student => ({
      id: student.student_id,
      name: student.name,
      department: student.department,
      points: student.points,
      rank: student.rank
    }));
  }, [topStudents]);

  // Transform topDepartments to match RankingItem interface
  const transformedDepartments = useMemo(() => {
    return (topDepartments || []).map(dept => ({
      id: dept.department,
      name: dept.department,
      department: dept.department,
      points: dept.points,
      rank: dept.rank
    }));
  }, [topDepartments]);

  // Check for any critical errors
  const hasErrors = Object.values(errors).some(error => error !== null);

  if (hasErrors) {
    return <ErrorDisplay />;
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      
      {/* 1st Row: All Dashboard Stats Cards */}
      <DashboardStats
        todaysStats={todaysStats}
        dashboardData={dashboardData}
      />

      {/* 2nd Row: Student Rankings and User Profile - Side by Side with Equal Heights */}
      <DashboardGrid
        transformedStudents={transformedStudents}
        transformedDepartments={transformedDepartments}
        profile={profile}
        currentUserRank={currentUserRank}
        onCelebration={handleCelebration}
      />

      {/* 3rd Row: Position Context - Full Width */}
      <UserPositionCard
        profile={profile}
        currentUserRank={currentUserRank}
        positionContext={Array.isArray(positionContext) ? positionContext : []}
        onCelebration={handleCelebration}
        contextOnly={true}
      />

      {isAdmin && todaysProducts.length > 0 && (
        <TodaysSoldProductsTable products={todaysProducts} />
      )}

      <CelebrationManager
        showCelebration={showCelebration}
        showRankCelebration={showRankCelebration}
        currentUserRank={currentUserRank}
        onCelebrationComplete={() => setShowCelebration(false)}
        onRankCelebrationComplete={() => setShowRankCelebration(false)}
      />
    </DashboardLayout>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
