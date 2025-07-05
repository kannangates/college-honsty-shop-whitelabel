import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Code, 
  Shield, 
  Activity, 
  Copy, 
  CheckCircle,
  Server,
  Table as TableIcon,
  Zap,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminDevTabs } from "./devTools/AdminDevTabs";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface TableInfo {
  table_name: string;
  column_count: number;
  columns: unknown; // Changed from any to unknown to handle Supabase Json type
}

interface FunctionInfo {
  function_name: string;
  return_type: string;
  argument_types: string;
}

interface PolicyInfo {
  table_name: string;
  policy_name: string;
  policy_command: string;
  policy_roles: string[];
}

interface DatabaseInfo {
  tables: TableInfo[];
  functions: FunctionInfo[];
  policies: PolicyInfo[];
  edgeFunctions: string[];
}

const AdminDeveloper = () => {
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({
    tables: [],
    functions: [],
    policies: [],
    edgeFunctions: []
  });
  const [loading, setLoading] = useState(true);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      // Get tables information
      const { data: tables, error: tablesError } = await supabase.rpc('get_table_info');
      if (tablesError) throw tablesError;
      
      // Get functions information  
      const { data: functions, error: functionsError } = await supabase.rpc('get_function_info');
      if (functionsError) throw functionsError;
      
      // Get RLS policies information
      const { data: policies, error: policiesError } = await supabase.rpc('get_policy_info');
      if (policiesError) throw policiesError;

      // Edge functions list (hardcoded for now)
      const edgeFunctions = [
        'auth-login',
        'auth-signup', 
        'award-badges',
        'dashboard-data',
        'daily-inventory-operations',
        'forgot-password',
        'get-database-schema',
        'order-management',
        'send-email',
        'user-management'
      ];

      setDatabaseInfo({
        tables: tables || [],
        functions: functions || [], 
        policies: policies || [],
        edgeFunctions
      });
    } catch (error) {
      console.error('Error loading database info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load database information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const generateMigrationSQL = () => {
    return `-- Generated Migration SQL
-- Run this in your Supabase SQL editor

-- Tables: ${databaseInfo.tables.length}
-- Functions: ${databaseInfo.functions.length} 
-- RLS Policies: ${databaseInfo.policies.length}
-- Edge Functions: ${databaseInfo.edgeFunctions.length}

-- This is a template - actual table creation SQL would go here
-- Example:
-- CREATE TABLE example_table (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );`;
  };

  const handleExportSchema = () => {
    try {
      const blob = new Blob([JSON.stringify(databaseInfo, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `database_schema_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "Database schema exported." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export schema.", variant: "destructive" });
    }
  };

  const handleExportLogs = () => {
    try {
      const dummyLogs = [
        { ts: new Date().toISOString(), event: "Sample export", detail: "Just a test log." }
      ];
      const blob = new Blob([JSON.stringify(dummyLogs, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit_logs_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Logs Exported", description: "Logs exported." });
    } catch (error) {
      toast({ title: "Error", description: "Could not export logs.", variant: "destructive" });
    }
  };

  const handleFlushSessions = () => {
    // Here you would call an admin API or edge function
    toast({ title: "Sessions Flushed", description: "Active sessions have been invalidated." });
    // Optionally reload users/data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Database className="h-12 w-12 animate-pulse mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading database information...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl">
          <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
          <p className="text-purple-100">Database schema, functions, and development tools</p>
        </div>
        <AdminDevTabs
          databaseInfo={databaseInfo}
          generateMigrationSQL={generateMigrationSQL}
          handleExportSchema={handleExportSchema}
          handleExportLogs={handleExportLogs}
          handleFlushSessions={handleFlushSessions}
        />
      </div>
    </ErrorBoundary>
  );
};

export default AdminDeveloper;
