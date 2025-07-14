import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Trophy, Award, Bell, BarChart } from 'lucide-react';

const AdminN8N: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 text-left text-sm">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Webhook className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">n8n Automation</h1>
            <p className="text-purple-100">Configure automated workflows for gamification and rewards</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Points Automation */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <CardTitle>Points Automation</CardTitle>
            </div>
            <CardDescription>Configure automated points allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>n8n Webhook URL</Label>
              <Input 
                placeholder="https://n8n.yourdomain.com/webhook/points-allocation"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This webhook will be triggered when orders are paid to allocate points based on payment timing
              </p>
            </div>
            <Button variant="outline" size="sm">
              Test Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Badge Automation */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <CardTitle>Badge Automation</CardTitle>
            </div>
            <CardDescription>Configure automated badge awards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>n8n Webhook URL</Label>
              <Input 
                placeholder="https://n8n.yourdomain.com/webhook/badge-awards"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This webhook will be triggered when students reach point thresholds to award badges
              </p>
            </div>
            <Button variant="outline" size="sm">
              Test Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Notification Automation */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              <CardTitle>Notification Automation</CardTitle>
            </div>
            <CardDescription>Configure automated notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>n8n Webhook URL</Label>
              <Input 
                placeholder="https://n8n.yourdomain.com/webhook/notifications"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This webhook will be triggered to send notifications for points and badge achievements
              </p>
            </div>
            <Button variant="outline" size="sm">
              Test Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Automation */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <CardTitle>Analytics Automation</CardTitle>
            </div>
            <CardDescription>Configure automated reporting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>n8n Webhook URL</Label>
              <Input 
                placeholder="https://n8n.yourdomain.com/webhook/analytics"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This webhook will be triggered to generate and send automated reports
              </p>
            </div>
            <Button variant="outline" size="sm">
              Test Webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure n8n workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Set up an n8n instance or use your existing one</li>
            <li>Create new workflows for each automation type:
              <ul className="list-disc list-inside ml-4 mt-1 text-sm text-gray-500">
                <li>Points allocation based on payment timing</li>
                <li>Badge awards based on point thresholds</li>
                <li>Notification triggers for achievements</li>
                <li>Analytics and reporting automation</li>
              </ul>
            </li>
            <li>Configure webhook nodes in n8n and copy the webhook URLs</li>
            <li>Paste the webhook URLs in the corresponding fields above</li>
            <li>Use the Test buttons to verify the webhooks are working</li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
            <p className="text-sm text-yellow-700">
              Make sure your n8n instance is properly secured and accessible only through HTTPS. 
              All webhook URLs should be authenticated to prevent unauthorized access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminN8N;
