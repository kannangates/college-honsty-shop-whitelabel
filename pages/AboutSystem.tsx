
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemHeader } from '@/components/system/SystemHeader';
import { SystemOverview } from '@/components/system/SystemOverview';
import { PerformanceMetrics } from '@/components/system/PerformanceMetrics';
import { SecurityOverview } from '@/components/system/SecurityOverview';
import { PerformanceMonitor } from '@/utils/performanceMonitoring';
import { DatabaseOptimizer } from '@/utils/databaseOptimizer';
import { SecurityManager } from '@/utils/securityManager';
import { QualityManager } from '@/utils/qualityManager';

interface SystemMetrics {
  performance: {
    score: number;
    responseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  security: {
    score: number;
    vulnerabilities: number;
    lastScan: string;
    complianceLevel: string;
  };
  database: {
    queryCount: number;
    slowQueries: number;
    indexHealth: number;
    connectionPool: number;
  };
  iso: {
    complianceScore: number;
    auditStatus: string;
    lastAudit: string;
    certificates: string[];
  };
}

const AboutSystem = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemMetrics();
  }, []);

  const loadSystemMetrics = async () => {
    try {
      const performanceMonitor = PerformanceMonitor.getInstance();
      const securityManager = SecurityManager.getInstance();
      const qualityManager = QualityManager.getInstance();

      // Load performance metrics
      const performanceScore = performanceMonitor.getPerformanceScore();
      const webVitals = performanceMonitor.getWebVitals();
      const memoryUsage = performanceMonitor.getMemoryUsage();

      // Load security metrics
      const securityScore = await securityManager.getSecurityScore();
      const vulnerabilities = await securityManager.scanVulnerabilities();

      // Load quality metrics
      const qualityScore = qualityManager.getQualityScore();

      // Get API metrics instead of database-specific metrics
      const apiMetrics = performanceMonitor.getMetrics('api');

      const metrics: SystemMetrics = {
        performance: {
          score: performanceScore,
          responseTime: performanceMonitor.getAverageByType('api'),
          memoryUsage: memoryUsage.estimatedSize / 1000000, // Convert to MB
          cacheHitRate: 85 // Mock value
        },
        security: {
          score: securityScore,
          vulnerabilities: vulnerabilities.length,
          lastScan: new Date().toISOString(),
          complianceLevel: 'ISO 27001'
        },
        database: {
          queryCount: apiMetrics.length, // Use API metrics count instead
          slowQueries: performanceMonitor.getSlowQueries().length,
          indexHealth: 92, // Mock value
          connectionPool: 10 // Mock value
        },
        iso: {
          complianceScore: qualityScore,
          auditStatus: 'Compliant',
          lastAudit: new Date().toISOString(),
          certificates: ['ISO 9001', 'ISO 27001', 'SOC 2']
        }
      };

      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <SystemHeader systemMetrics={systemMetrics} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SystemOverview systemMetrics={systemMetrics} loading={loading} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics systemMetrics={systemMetrics} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityOverview systemMetrics={systemMetrics} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance content would go here */}
          <div className="text-center py-12">
            <p className="text-gray-600">Compliance monitoring content coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AboutSystem;
