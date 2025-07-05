
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Code, Copy, CheckCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MigrationExportCard({
  generateMigrationSQL,
  copied,
  handleCopy,
  handleExportSchema,
  handleExportLogs,
  handleFlushSessions
}: {
  generateMigrationSQL: () => string;
  copied: boolean;
  handleCopy: () => void;
  handleExportSchema: () => void;
  handleExportLogs: () => void;
  handleFlushSessions: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" /> Migration Helper
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* SQL block with copy */}
          <div className="bg-gray-50 p-4 rounded-lg mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Generated Migration SQL</h3>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              <code>{generateMigrationSQL()}</code>
            </pre>
          </div>
          {/* Export/Flush tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button variant="secondary" onClick={handleExportSchema}>Export Schema JSON</Button>
            <Button variant="secondary" onClick={handleExportLogs}>Export Audit Logs</Button>
            <Button variant="destructive" onClick={handleFlushSessions}>
              <LogOut className="mr-2 h-4 w-4" /> Flush Sessions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
