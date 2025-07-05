
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
            <span>Security Score</span>
            <Badge variant={systemMetrics?.security.score >= 80 ? "default" : "destructive"}>
              {systemMetrics?.security.score || 0}/100
            </Badge>
          </div>
          <Progress value={systemMetrics?.security.score} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span>Vulnerabilities</span>
            <Badge variant={systemMetrics?.security.vulnerabilities === 0 ? "default" : "destructive"}>
              {systemMetrics?.security.vulnerabilities || 0}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Compliance Level</span>
            <Badge variant="default">{systemMetrics?.security.complianceLevel}</Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            Last Security Scan: {systemMetrics?.security.lastScan ? 
              new Date(systemMetrics.security.lastScan).toLocaleDateString() : 'Never'}
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
