import React from 'react';
import { ShoppingCart, DollarSign, Clock, User } from 'lucide-react';

interface TodaysStats {
  todays_orders?: number;
  total_revenue?: number;
}

interface DashboardStatsData {
  stats?: {
    totalOrders?: number;
    userPendingOrders?: number;
    todayUnpaidOrders?: number;
    totalUnpaidOrdersValue?: number;
  };
}

interface DashboardStatsProps {
  todaysStats: TodaysStats;
  dashboardData: DashboardStatsData;
}

const DashboardStats = React.memo(({ dashboardData }: DashboardStatsProps) => {
  const stats = React.useMemo(() => [
    {
      title: "Today's Orders",
      value: dashboardData?.stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: "Total orders of all users",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Your Pending Orders",
      value: dashboardData?.stats?.userPendingOrders || 0,
      icon: User,
      description: "Your unpaid orders",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Today's Pending Orders",
      value: dashboardData?.stats?.todayUnpaidOrders || 0,
      icon: Clock,
      description: "Today's unpaid orders",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Payment Pending Revenue",
      value: `₹${dashboardData?.stats?.totalUnpaidOrdersValue || 0}`,
      icon: DollarSign,
      description: "Total unpaid revenue",
      gradient: "from-amber-500 to-orange-500"
    }
  ], [dashboardData]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md hover:shadow-lg transition-all duration-200`}
          >
            {/* Content */}
            <div className="p-4">
              {/* Header with Icon and Value */}
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-md bg-white/20 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white leading-none">
                    {stat.value}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xs font-medium text-white/90 leading-tight">
                  {stat.title}
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;
