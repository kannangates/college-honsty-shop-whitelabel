
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Cpu, Globe } from 'lucide-react';

interface SystemMetrics {
  performance: {
    responseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
}

interface PerformanceMetricsProps {
  systemMetrics: SystemMetrics | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ systemMetrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold">
                {(systemMetrics?.performance.responseTime || 0).toFixed(2)}ms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold">
                {(systemMetrics?.performance.memoryUsage || 0).toFixed(2)}MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold">
                {(systemMetrics?.performance.cacheHitRate || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
