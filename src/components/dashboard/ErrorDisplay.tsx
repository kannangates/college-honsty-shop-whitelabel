
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export const ErrorDisplay: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-100 p-6">
      <div className="max-w-screen-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Unable to load dashboard data</h3>
                <p className="text-sm">Please refresh the page or try again later.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
