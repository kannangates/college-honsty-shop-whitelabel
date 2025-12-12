
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface OrderStatsProps {
  stats: {
    todayOrders: number;
    revenue: number;
    unpaidRevenue: number;
    avgOrder: number;
  };
}

export const OrderStats = ({ stats }: OrderStatsProps) => {
  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue}`,
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Unpaid Revenue",
      value: `₹${stats.unpaidRevenue}`,
      icon: DollarSign,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Avg Order",
      value: `₹${stats.avgOrder}`,
      icon: TrendingUp,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
