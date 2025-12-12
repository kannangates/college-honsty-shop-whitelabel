
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Activity, Shield, Star, Zap, Cpu, Globe } from 'lucide-react';
import { WHITELABEL_CONFIG } from '@/config';
const APP_NAME = WHITELABEL_CONFIG.app.name;
const APP_TAGLINE = WHITELABEL_CONFIG.app.tagline;


interface SystemMetrics {
  performance: {
    score: number;
    responseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  security: { score: number };
  iso: { complianceScore: number };
}

interface SystemHeaderProps {
  systemMetrics: SystemMetrics | null;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({ systemMetrics }) => {
  // Helper function to format numbers without unnecessary decimals
  const formatNumber = (value: number): string => {
    if (value % 1 === 0) {
      return value.toString(); // Return whole number without decimals
    }
    return value.toFixed(2); // Return with 2 decimals if needed
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-gray-600 text-lg">{APP_TAGLINE}</p>
        </div>
      </div>

      {/* All System Metrics - 6 Widgets in Single Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:gap-2 xl:text-left">
              <Activity className="h-5 w-5 text-blue-600 mb-1 xl:mb-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-700 truncate">Performance</p>
                <p className="font-semibold text-blue-900 text-sm">
                  {systemMetrics?.performance.score ? formatNumber(systemMetrics.performance.score) : '0'}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:gap-2 xl:text-left">
              <Shield className="h-5 w-5 text-purple-600 mb-1 xl:mb-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-purple-700 truncate">Security</p>
                <p className="font-semibold text-purple-900 text-sm">
                  {systemMetrics?.security.score ? formatNumber(systemMetrics.security.score) : '0'}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:gap-2 xl:text-left">
              <Star className="h-5 w-5 text-orange-600 mb-1 xl:mb-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-orange-700 truncate">ISO Compliance</p>
                <p className="font-semibold text-orange-900 text-sm">
                  {systemMetrics?.iso.complianceScore ? formatNumber(systemMetrics.iso.complianceScore) : '0'}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:gap-2 xl:text-left">
              <Zap className="h-5 w-5 text-cyan-600 mb-1 xl:mb-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-cyan-700 truncate">Response Time</p>
                <p className="font-semibold text-cyan-900 text-sm">
                  {formatNumber(systemMetrics?.performance.responseTime || 0)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:gap-2 xl:text-left">
              <Cpu className="h-5 w-5 text-emerald-600 mb-1 xl:mb-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-emerald-700 truncate">Memory Usage</p>
                <p className="font-semibold text-emerald-900 text-sm">
                  {formatNumber(systemMetrics?.performance.memoryUsage || 0)}MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center xl:flex-row xl:items-center xl:gap-2 xl:text-left">
              <Globe className="h-5 w-5 text-violet-600 mb-1 xl:mb-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-violet-700 truncate">Cache Hit Rate</p>
                <p className="font-semibold text-violet-900 text-sm">
                  {formatNumber(systemMetrics?.performance.cacheHitRate || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
