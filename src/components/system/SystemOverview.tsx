
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/features/gamification/components/badge';
import { Info, BarChart3, CheckCircle } from 'lucide-react';

interface SystemMetrics {
  performance: { score: number };
  security: { score: number };
  database: { indexHealth: number };
  iso: { complianceScore: number };
}

interface SystemOverviewProps {
  systemMetrics: SystemMetrics | null;
  loading: boolean;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({ systemMetrics, loading }) => {
  // Helper function to format numbers without unnecessary decimals
  const formatNumber = (value: number): string => {
    if (value % 1 === 0) {
      return value.toString(); // Return whole number without decimals
    }
    return value.toFixed(2); // Return with 2 decimals if needed
  };

  return (
    <div className="space-y-6">
      {/* System Information and Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">2.0.0</span>
              </div>
              <div>
                <span className="text-gray-600">Environment:</span>
                <span className="ml-2 font-medium">Production</span>
              </div>
              <div>
                <span className="text-gray-600">Framework:</span>
                <span className="ml-2 font-medium">React 18.3</span>
              </div>
              <div>
                <span className="text-gray-600">Database:</span>
                <span className="ml-2 font-medium">Supabase PostgreSQL</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>ISO compliance monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Performance optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time monitoring</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Overall Performance</span>
                    <Badge variant={systemMetrics?.performance.score >= 80 ? "default" : "secondary"}>
                      {systemMetrics?.performance.score ? formatNumber(systemMetrics.performance.score) : '0'}/100
                    </Badge>
                  </div>
                  <Progress value={systemMetrics?.performance.score} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Security Status</span>
                    <Badge variant={systemMetrics?.security.score >= 80 ? "default" : "destructive"}>
                      {systemMetrics?.security.score ? formatNumber(systemMetrics.security.score) : '0'}/100
                    </Badge>
                  </div>
                  <Progress value={systemMetrics?.security.score} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">System Uptime</span>
                    <Badge variant="default">
                      99.9%
                    </Badge>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Compliance Score</span>
                    <Badge variant="default">
                      {systemMetrics?.iso.complianceScore ? formatNumber(systemMetrics.iso.complianceScore) : '0'}/100
                    </Badge>
                  </div>
                  <Progress value={systemMetrics?.iso.complianceScore} className="h-2" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
