import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  }, [loadDatabaseInfo]);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Developer Dashboard</CardTitle>
          <CardDescription>View database information and manage settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold mb-2">Table Information</h2>
                {tableInfo.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {tableInfo.map((table, index) => (
                      <li key={index}>
                        <strong>{table.table_name}</strong> - Rows: {table.row_count}, Size: {table.table_size}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No table information available.</p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Function Information</h2>
                {functionInfo.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {functionInfo.map((func, index) => (
                      <li key={index}>
                        <strong>{func.function_name}</strong> - Language: {func.function_language}, Definition: {func.function_definition}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No function information available.</p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Policy Information</h2>
                {policyInfo.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {policyInfo.map((policy, index) => (
                      <li key={index}>
                        <strong>{policy.policy_name}</strong> - Table: {policy.table_name}, Command: {policy.policy_command}, Expression: {policy.policy_definition}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No policy information available.</p>
                )}
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeveloper;
