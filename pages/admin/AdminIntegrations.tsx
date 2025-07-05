
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Mail, CreditCard, Webhook } from 'lucide-react';
import { IntegrationSettingsDisplay } from '@/components/admin/IntegrationSettingsDisplay';

const AdminIntegrations = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Integration Settings</h1>
            <p className="text-purple-100">Configure payment gateways, email services, and other integrations</p>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-blue-800">Payment Gateway</div>
            <div className="text-sm text-blue-600">Razorpay Integration</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-green-800">Email Service</div>
            <div className="text-sm text-green-600">Gmail Integration</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Webhook className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold text-purple-800">Webhooks</div>
            <div className="text-sm text-purple-600">Event Notifications</div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Settings */}
      <IntegrationSettingsDisplay />

      {/* Instructions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure your integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-base mb-2">Razorpay Payment Gateway</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Sign up at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">razorpay.com</a></li>
              <li>Navigate to Settings → API Keys</li>
              <li>Generate Test/Live API Keys</li>
              <li>Copy the Key ID and Secret</li>
              <li>Configure webhook URL for payment notifications</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold text-base mb-2">Gmail Integration</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable Gmail API</li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Add authorized redirect URIs</li>
              <li>Generate refresh token for server-to-server communication</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Security Notice</h4>
            <p className="text-sm text-yellow-700">
              All sensitive data is stored encrypted in the database. The system only displays masked values for security. 
              Only users with admin privileges can view and modify these settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntegrations;
