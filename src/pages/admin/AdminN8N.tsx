import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminN8N: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 text-left text-sm">
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">n8n Integration</h1>
        <p className="text-gray-200 text-sm">Configure and monitor n8n workflows connected to the Honesty Shop.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The n8n integration interface is under construction. In the meantime, you can access the
            standalone n8n instance if configured, or contact the developer team for workflow
            changes.
          </p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminN8N;
