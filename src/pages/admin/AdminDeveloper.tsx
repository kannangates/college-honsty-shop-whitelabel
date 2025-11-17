import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Database, Code, Shield } from 'lucide-react';

const AdminDeveloper = () => {
  interface TableInfo {
  table_name: string;
  row_count: number;
  table_size: string;
}
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  interface FunctionInfo {
  function_name: string;
  function_language: string;
  function_definition: string;
}
  const [functionInfo, setFunctionInfo] = useState<FunctionInfo[]>([]);
  interface PolicyInfo {
  policy_name?: string;
  table_name?: string;
  policy_definition?: string;
  policy_command?: string;
}
  const [policyInfo, setPolicyInfo] = useState<PolicyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDatabaseInfo = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch table information
      const { data: tableData, error: tableError } = await supabase
        .rpc('get_table_info');
      
      if (tableError) throw tableError;
      setTableInfo((tableData || []).map(item => ({
        table_name: item.table_name,
        row_count: 0, // Mock value since API doesn't provide this
        table_size: 'Unknown' // Mock value since API doesn't provide this
      })));

      // Fetch function information  
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_function_info');
        
      if (functionError) throw functionError;
      setFunctionInfo((functionData || []).map(item => ({
        function_name: item.function_name,
        function_language: 'plpgsql', // Mock value since API doesn't provide this
        function_definition: `Returns: ${item.return_type}, Args: ${item.argument_types}` // Mock definition
      })));

      // Fetch policy information
      const { data: policyData, error: policyError } = await supabase
        .rpc('get_policy_info');
        
      if (policyError) throw policyError;
      setPolicyInfo(policyData || []);

    } catch (error) {
      console.error('Error loading database info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load database information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDatabaseInfo();

    // Set up real-time subscriptions for database changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public'
        },
        () => {
          console.log('Database change detected, reloading...');
          loadDatabaseInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDatabaseInfo]);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <p className="text-purple-100 mt-1">Real-time database monitoring and information</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading database information..." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tables Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Tables ({tableInfo.length})
              </CardTitle>
              <CardDescription>Database tables and structure</CardDescription>
            </CardHeader>
            <CardContent>
              {tableInfo.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tableInfo.map((table, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="font-semibold text-sm">{table.table_name}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Rows: {table.row_count} • Size: {table.table_size}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No tables found</p>
              )}
            </CardContent>
          </Card>

          {/* Functions Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Functions ({functionInfo.length})
              </CardTitle>
              <CardDescription>Database functions and procedures</CardDescription>
            </CardHeader>
            <CardContent>
              {functionInfo.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {functionInfo.map((func, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="font-semibold text-sm">{func.function_name}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Language: {func.function_language}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {func.function_definition}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No functions found</p>
              )}
            </CardContent>
          </Card>

          {/* Policies Section */}
          <Card className="shadow-lg md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                RLS Policies ({policyInfo.length})
              </CardTitle>
              <CardDescription>Row-level security policies</CardDescription>
            </CardHeader>
            <CardContent>
              {policyInfo.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {policyInfo.map((policy, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="font-semibold text-sm">{policy.policy_name}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Table: <span className="font-mono">{policy.table_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Command: <span className="font-mono">{policy.policy_command}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No policies found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDeveloper;
