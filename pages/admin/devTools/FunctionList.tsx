import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FunctionInfo {
  function_name: string;
  return_type: string;
  argument_types: string;
}

export const FunctionList = ({ functions }: { functions: FunctionInfo[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5" /> Database Functions ({functions.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {functions.map((func, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold">{func.function_name}</span>
              <Badge variant="outline">Function</Badge>
            </div>
            <div className="text-xs text-gray-600">
              <div>Returns: {func.return_type}</div>
              {func.argument_types && <div>Args: {func.argument_types}</div>}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
