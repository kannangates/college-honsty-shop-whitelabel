import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Database, 
  Globe, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { PerformanceMonitor } from '@/utils/performanceMonitoring';
import { DatabaseOptimizer } from '@/utils/databaseOptimizer';
import { CDNManager } from '@/utils/cdnManager';
import { WHITELABEL_CONFIG } from '@/config';

interface PerformanceData {
  overallScore: number;
  averageResponseTime: number;
  totalQueries: number;
  pageLoadScore: number;
  databaseScore: number;
  memoryScore: number;
  networkScore: number;
  recentEvents: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

interface CdnStats {
  size: number;
  urls: string[];
}

interface DbOptimization {
  slowQueries: Array<{
    query: string;
    avgTime: number;
    calls: number;
    suggestion: string;
  }>;
  indexSuggestions: Array<{
    table: string;
    columns: string[];
    type: string;
    reason: string;
    priority: string;
  }>;
  optimizationTips: string[];
}

export const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [dbOptimization, setDbOptimization] = useState<DbOptimization | null>(null);
  const [cdnStats, setCdnStats] = useState<CdnStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      const performanceMonitor = PerformanceMonitor.getInstance();
      const dbOptimizer = DatabaseOptimizer.getInstance();
      const cdnManager = CDNManager.getInstance();

      // Create mock performance report from available methods
      const performanceScore = performanceMonitor.getPerformanceScore();
      const webVitals = performanceMonitor.getWebVitals();
      const memoryUsage = performanceMonitor.getMemoryUsage();
      const slowQueries = performanceMonitor.getSlowQueries();
      
      const mockPerformanceReport = {
        overallScore: performanceScore,
        averageResponseTime: performanceMonitor.getAverageByType('api'),
        totalQueries: performanceMonitor.getMetrics('api').length,
        pageLoadScore: Math.max(0, 100 - (webVitals.lcp || 0) / 50),
        databaseScore: Math.max(0, 100 - slowQueries.length * 10),
        memoryScore: memoryUsage.estimatedSize / 10000,
        networkScore: Math.max(0, 100 - performanceMonitor.getAverageByType('resource') / 50),
        recentEvents: [
          {
            type: 'improvement',
            title: 'Performance Monitoring Active',
            description: 'System monitoring initialized successfully',
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      };

      const [dbAnalysis, cacheStats] = await Promise.all([
        dbOptimizer.analyzePerformance(),
        Promise.resolve(cdnManager.getCacheStats())
      ]);

      setPerformanceData(mockPerformanceReport);
      setDbOptimization(dbAnalysis);
      setCdnStats(cacheStats);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(performanceData?.overallScore || 0)}`}>
                  {performanceData?.overallScore || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {performanceData?.averageResponseTime || 0}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">DB Queries</p>
                <p className="text-2xl font-bold">
                  {performanceData?.totalQueries || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">CDN Cache Hits</p>
                <p className="text-2xl font-bold">
                  {cdnStats?.size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Real-time performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Page Load Speed</span>
                <Badge className={getScoreBadge(performanceData?.pageLoadScore || 0)}>
                  {performanceData?.pageLoadScore || 0}/100
                </Badge>
              </div>
              <Progress value={performanceData?.pageLoadScore || 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Database Performance</span>
                <Badge className={getScoreBadge(performanceData?.databaseScore || 0)}>
                  {performanceData?.databaseScore || 0}/100
                </Badge>
              </div>
              <Progress value={performanceData?.databaseScore || 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Memory Usage</span>
                <Badge className={getScoreBadge(performanceData?.memoryScore || 0)}>
                  {performanceData?.memoryScore || 0}%
                </Badge>
              </div>
              <Progress value={performanceData?.memoryScore || 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Network Efficiency</span>
                <Badge className={getScoreBadge(performanceData?.networkScore || 0)}>
                  {performanceData?.networkScore || 0}/100
                </Badge>
              </div>
              <Progress value={performanceData?.networkScore || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Optimization
            </CardTitle>
            <CardDescription>Database performance insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dbOptimization?.slowQueries?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Slow Queries ({dbOptimization.slowQueries.length})
                </h4>
                <div className="space-y-2">
                  {dbOptimization.slowQueries.slice(0, 3).map((query: DbOptimization['slowQueries'][0], index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded text-sm">
                      <div className="font-medium">Avg: {query.avgTime}ms</div>
                      <div className="text-gray-600 truncate">{query.suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dbOptimization?.indexSuggestions?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Index Suggestions ({dbOptimization.indexSuggestions.length})
                </h4>
                <div className="space-y-2">
                  {dbOptimization.indexSuggestions.slice(0, 3).map((suggestion: DbOptimization['indexSuggestions'][0], index: number) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium">{suggestion.table}.{suggestion.columns.join(', ')}</div>
                      <div className="text-gray-600">{suggestion.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.open('/admin/database-optimization', '_blank')}
            >
              View Full Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Events</CardTitle>
          <CardDescription>Latest performance-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData?.recentEvents?.length > 0 ? (
              performanceData.recentEvents.map((event: PerformanceData['recentEvents'][0], index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {event.type === 'improvement' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : event.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{event.timestamp}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No performance events recorded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
