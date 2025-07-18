import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Badge } from '@/features/gamification/components/badge';

interface PolicyInfo {
  table_name: string;
  policy_name: string;
  policy_command: string;
  policy_roles: string[];
}

export const PolicyList = ({ policies }: { policies: PolicyInfo[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Lock className="h-5 w-5" /> RLS Policies
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {policies.map((policy, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold">{policy.policy_name}</span>
              <Badge variant="outline">{policy.policy_command}</Badge>
            </div>
            <div className="text-xs text-gray-600">Table: {policy.table_name}</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
