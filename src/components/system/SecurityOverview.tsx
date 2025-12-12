
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/features/gamification/components/badge';
import { Shield, CheckCircle } from 'lucide-react';

interface SystemMetrics {
  security: {
    score: number;
    vulnerabilities: number;
    complianceLevel: string;
    lastScan: string;
  };
}

interface SecurityOverviewProps {
  systemMetrics: SystemMetrics | null;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ systemMetrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Active Threats Detected</span>
            <Badge variant={systemMetrics?.security.vulnerabilities === 0 ? "default" : "destructive"}>
              {systemMetrics?.security.vulnerabilities || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Security Standard</span>
            <Badge variant="default">{systemMetrics?.security.complianceLevel || 'ISO 27001'}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Last Security Scan</span>
            <span className="text-sm text-gray-600">
              {systemMetrics?.security.lastScan ?
                new Date(systemMetrics.security.lastScan).toLocaleDateString() : 'Today'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Firewall Status</span>
            <Badge variant="default">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Multi-factor Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Role-based Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Session Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Audit Logging</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Data Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Rate Limiting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
