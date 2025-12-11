import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Clock, Package } from 'lucide-react';

interface TodaysStats {
  todays_orders?: number;
  total_revenue?: number;
}

interface DashboardStatsData {
  stats?: {
    pendingOrders?: number;
    lowStockItems?: number;
  };
}

interface DashboardStatsProps {
  todaysStats: TodaysStats;
  dashboardData: DashboardStatsData;
}

const DashboardStats = React.memo(({ todaysStats, dashboardData }: DashboardStatsProps) => {
  const stats = React.useMemo(() => [
    {
      title: "Today's Orders",
      value: todaysStats?.todays_orders || 0,
      icon: ShoppingCart,
      description: "Orders placed today"
    },
    {
      title: "Today's Revenue",
      value: `₹${todaysStats?.total_revenue || 0}`,
      icon: DollarSign,
      description: "Revenue generated today"
    },
    {
      title: "Pending Orders",
      value: dashboardData?.stats?.pendingOrders || 0,
      icon: Clock,
      description: "Orders awaiting payment"
    },
    {
      title: "Low Stock Items",
      value: dashboardData?.stats?.lowStockItems || 0,
      icon: Package,
      description: "Items running low"
    }
  ], [todaysStats, dashboardData]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;
