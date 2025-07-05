
import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy load dashboard components
const DashboardStats = lazy(() => import('./DashboardStats'));
const RankingsSection = lazy(() => import('./RankingsSection'));
const GameStyleUserCard = lazy(() => import('../ui/GameStyleUserCard'));
const TodaysSoldProductsTable = lazy(() => import('../ui/TodaysSoldProductsTable'));

interface LazyComponentProps {
  component: 'stats' | 'rankings' | 'userCard' | 'productsTable';
  props?: any;
}

const LazyComponentWrapper: React.FC<LazyComponentProps> = ({ component, props }) => {
  const LoadingFallback = () => (
    <Card className="min-h-[200px]">
      <CardContent className="flex items-center justify-center h-full p-6">
        <LoadingSpinner />
      </CardContent>
    </Card>
  );

  const renderComponent = () => {
    switch (component) {
      case 'stats':
        return <DashboardStats {...props} />;
      case 'rankings':
        return <RankingsSection {...props} />;
      case 'userCard':
        return <GameStyleUserCard {...props} />;
      case 'productsTable':
        return <TodaysSoldProductsTable {...props} />;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderComponent()}
    </Suspense>
  );
};

export default LazyComponentWrapper;
