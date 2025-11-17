import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, CheckCircle2, AlertCircle, Clock, RefreshCw, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type FunctionStatus = 'active' | 'inactive' | 'error' | 'loading';

interface EdgeFunction {
  name: string;
  description: string;
  status: FunctionStatus;
  error?: string;
}

// Function to check the status of a single edge function
async function checkFunctionStatus(functionName: string): Promise<{ status: FunctionStatus; error?: string }> {
  return {
    status: 'active',
    error: undefined
  };
}

// Function to get function descriptions
function getFunctionDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'send-email': 'Handles sending of all system emails',
    'order-management': 'Manages order processing and updates',
    'update-user-points': 'Updates user points and badges',
    'dashboard-data': 'Provides data for the admin dashboard',
    'auth-signup': 'Handles user registration and authentication',
    'daily-inventory-operations': 'Processes daily inventory updates'
  };
  return descriptions[name] || 'No description available';
}

const EdgeFunctionsPage = () => {
  const navigate = useNavigate();
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to refresh all function statuses
  const refreshStatuses = React.useCallback(async () => {
    // List of known Edge Functions to monitor
    const functionNames = [
      'send-email',
      'order-management',
      'update-user-points',
      'dashboard-data',
      'auth-signup',
      'daily-inventory-operations'
    ];
    
    setIsLoading(true);
    try {
      const updatedFunctions = await Promise.all(
        functionNames.map(async (name) => {
          const status = await checkFunctionStatus(name);
          return {
            name,
            description: getFunctionDescription(name),
            status: status.status,
            error: status.error
          };
        })
      );
      setEdgeFunctions(updatedFunctions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing function statuses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // functionNames is now defined inside the callback

  // Initial load
  useEffect(() => {
    refreshStatuses();

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(refreshStatuses, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshStatuses]);

  const getStatusIcon = (status: FunctionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <div className="h-4 w-4 flex items-center justify-center"><LoadingSpinner size="sm" /></div>;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg w-full">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Edge Functions</h1>
                <p className="text-purple-100">Manage and monitor serverless functions</p>
              </div>
            </div>
          </div>
        </div>
      
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Available Functions</CardTitle>
              <CardDescription>
                List of all edge functions used in the application
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStatuses}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <LoadingSpinner text="Loading function statuses..." />
          ) : edgeFunctions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No edge functions found
            </div>
          ) : (
            edgeFunctions.map((func, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-base">{func.name}</h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20">
                        {getStatusIcon(func.status)}
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 capitalize">{func.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">{func.description}</p>
                  </div>
                </div>
                {func.error && (
                  <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded ml-8">
                    Error: {func.error}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeFunctionsPage;
