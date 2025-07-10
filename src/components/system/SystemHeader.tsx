
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, CheckCircle, Activity, Shield, Star } from 'lucide-react';
import { WHITELABEL_CONFIG } from '@/config';
const APP_NAME = WHITELABEL_CONFIG.app.name;
const APP_TAGLINE = WHITELABEL_CONFIG.app.tagline;
const APP_SUBTITLE = WHITELABEL_CONFIG.app.subtitle;
const APP_DESCRIPTION = WHITELABEL_CONFIG.app.description;

interface SystemMetrics {
  performance: { score: number };
  security: { score: number };
  iso: { complianceScore: number };
}

interface SystemHeaderProps {
  systemMetrics: SystemMetrics | null;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({ systemMetrics }) => {
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700">System Status</p>
                <p className="font-semibold text-green-900">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Performance</p>
                <p className="font-semibold text-blue-900">
                  {systemMetrics?.performance.score || 0}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Security</p>
                <p className="font-semibold text-purple-900">
                  {systemMetrics?.security.score || 0}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">ISO Compliance</p>
                <p className="font-semibold text-orange-900">
                  {systemMetrics?.iso.complianceScore || 0}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
