import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TableList } from "./TableList";
import { FunctionList } from "./FunctionList";
import { PolicyList } from "./PolicyList";
import { EdgeFunctionsList } from "./EdgeFunctionsList";
import { MigrationExportCard } from "./MigrationExportCard";
import { useToast } from "@/hooks/use-toast";

interface AdminDevTabsProps {
  databaseInfo: {
    tables: Array<{
      table_name: string;
      column_count: number;
      columns: unknown;
    }>;
    functions: Array<{
      function_name: string;
      return_type: string;
      argument_types: string;
    }>;
    policies: Array<{
      table_name: string;
      policy_name: string;
      policy_command: string;
      policy_roles: string[];
    }>;
    edgeFunctions: string[];
  };
  generateMigrationSQL: () => string;
  handleExportSchema: () => void;
  handleExportLogs: () => void;
  handleFlushSessions: () => void;
}

export const AdminDevTabs = ({
  databaseInfo,
  generateMigrationSQL,
  handleExportSchema,
  handleExportLogs,
  handleFlushSessions
}: AdminDevTabsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMigrationSQL());
      setCopied(true);
      toast({ title: "Copied!", description: "Migration SQL copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy SQL", variant: "destructive" });
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="database">Database Info</TabsTrigger>
        <TabsTrigger value="tables">Tables</TabsTrigger>
        <TabsTrigger value="functions">Functions</TabsTrigger>
        <TabsTrigger value="migrations">Migrations</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <TableList tables={databaseInfo.tables} />
          </div>
          <div>
            <FunctionList functions={databaseInfo.functions} />
          </div>
          <div>
            <PolicyList policies={databaseInfo.policies} />
          </div>
          <div>
            <EdgeFunctionsList edgeFunctions={databaseInfo.edgeFunctions} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="database">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableList tables={databaseInfo.tables} />
          <FunctionList functions={databaseInfo.functions} />
          <PolicyList policies={databaseInfo.policies} />
          <EdgeFunctionsList edgeFunctions={databaseInfo.edgeFunctions} />
        </div>
      </TabsContent>

      <TabsContent value="tables">
        <TableList tables={databaseInfo.tables} />
      </TabsContent>
      <TabsContent value="functions">
        <FunctionList functions={databaseInfo.functions} />
      </TabsContent>
      <TabsContent value="migrations">
        <MigrationExportCard
          generateMigrationSQL={generateMigrationSQL}
          copied={copied}
          handleCopy={handleCopy}
          handleExportSchema={handleExportSchema}
          handleExportLogs={handleExportLogs}
          handleFlushSessions={handleFlushSessions}
        />
      </TabsContent>
    </Tabs>
  );
};
