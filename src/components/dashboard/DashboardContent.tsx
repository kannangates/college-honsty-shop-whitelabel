
import React, { useState, useCallback, useMemo } from "react";
import DashboardStats from './DashboardStats';
import UserPositionCard from './UserPositionCard';
import TodaysSoldProductsTable from '../ui/TodaysSoldProductsTable';
import { DashboardLayout } from './DashboardLayout';
import { DashboardGrid } from './DashboardGrid';
import { CelebrationManager } from './CelebrationManager';
import { ErrorDisplay } from './ErrorDisplay';
import { useAuth } from '@/contexts/useAuth';
import { useDashboardData } from "@/hooks/useDashboardData";
import { Construction, Sparkles } from 'lucide-react';

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
      {/* 1st Row: All Dashboard Stats Cards */}
      <DashboardStats
        todaysStats={todaysStats}
        dashboardData={dashboardData}
      />

      {/* Sections below widgets with blur effect and coming soon overlay */}
      <div className="relative">
        {/* Coming Soon Overlay with Glass Effect */}
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-xl max-w-sm mx-4">
            <div className="flex items-center justify-center mb-3">
              <Construction className="h-6 w-6 text-gray-700 mr-2 animate-bounce" />
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Coming Soon! ✨
            </h3>
            <p className="text-gray-700 text-sm font-medium mb-2">
              We're building something amazing! 🚀
            </p>
            <p className="text-gray-600 text-xs">
              Advanced analytics and insights are on the way!
            </p>
            <div className="mt-3 flex justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>

        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none space-y-6">
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
        </div>
      </div>

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
