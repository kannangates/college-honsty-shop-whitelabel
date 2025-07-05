import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Database, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SlowQuery {
  query: string;
  avgTime: number;
  calls: number;
  suggestion: string;
}

interface IndexSuggestion {
  table: string;
  columns: string[];
  type: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface DbOptimization {
  slowQueries: SlowQuery[];
  indexSuggestions: IndexSuggestion[];
  optimizationTips: string[];
}

interface DatabaseOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbOptimization: DbOptimization;
}

const DatabaseOptimizationModal = ({ isOpen, onClose, dbOptimization }: DatabaseOptimizationModalProps) => {
  if (!dbOptimization) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Optimization Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Slow Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                Slow Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dbOptimization.slowQueries?.map((query: SlowQuery, index: number) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-orange-600">
                        {query.avgTime}ms avg
                      </Badge>
                      <span className="text-sm text-gray-500">{query.calls} calls</span>
                    </div>
                    <code className="block text-sm bg-gray-100 p-2 rounded text-gray-800">
                      {query.query}
                    </code>
                    <p className="text-sm text-blue-600">💡 {query.suggestion}</p>
                  </div>
                ))}
                
                {!dbOptimization.slowQueries?.length && (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No slow queries detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Index Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Index Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dbOptimization.indexSuggestions?.map((suggestion: IndexSuggestion, index: number) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{suggestion.table}</Badge>
                        <Badge variant={
                          suggestion.priority === 'high' ? 'destructive' :
                          suggestion.priority === 'medium' ? 'secondary' : 'default'
                        }>
                          {suggestion.priority} priority
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{suggestion.type}</span>
                    </div>
                    <p className="text-sm">
                      <strong>Columns:</strong> {suggestion.columns.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Optimization Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dbOptimization.optimizationTips?.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseOptimizationModal;
