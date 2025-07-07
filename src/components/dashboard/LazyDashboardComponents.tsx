
import { lazy } from 'react';

// Lazy load dashboard components for better performance
export const LazyDashboardStats = lazy(() => import('./DashboardStats'));
export const LazyRankingsSection = lazy(() => import('./RankingsSection'));
export const LazyUserPositionCard = lazy(() => import('./UserPositionCard'));

// Fallback component for lazy loading
export const LoadingFallback = ({ error }: { error?: Error }) => {
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Failed to load component</p>
        <p className="text-sm opacity-75">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
};
