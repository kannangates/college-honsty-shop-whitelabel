import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table as TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColumnInfo {
  column_name: string;
  data_type?: string;
}

interface TableInfo {
  table_name: string;
  column_count: number;
  columns: ColumnInfo[] | unknown;
}

export const TableList = ({ tables }: { tables: TableInfo[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TableIcon className="h-5 w-5" />
        Database Tables ({tables.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tables.map((table, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold">{table.table_name}</span>
              <Badge variant="outline">{table.column_count} columns</Badge>
            </div>
            <div className="text-xs text-gray-600">
              Columns: {Array.isArray(table.columns) ? table.columns.map((col: ColumnInfo) => col.column_name).join(', ') : 'Loading...'}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
