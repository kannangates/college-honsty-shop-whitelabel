
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";
import { Badge } from '@/features/gamification/components/badge';

export const EdgeFunctionsList = ({ edgeFunctions }: { edgeFunctions: string[] }) => (
    
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Server className="h-5 w-5" /> Edge Functions ({edgeFunctions.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {edgeFunctions.map((func, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="font-mono text-sm">{func}</span>
            <Badge variant="outline">Active</Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
