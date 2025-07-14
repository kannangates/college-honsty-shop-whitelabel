
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Mail, CreditCard, Webhook, Trophy, Award, Bell, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WEBHOOK_TYPES = [
  { type: 'points', label: 'Points Automation', icon: <Trophy className="h-5 w-5 text-yellow-600" /> },
  { type: 'badge', label: 'Badge Automation', icon: <Award className="h-5 w-5 text-purple-600" /> },
  { type: 'notification', label: 'Notification Automation', icon: <Bell className="h-5 w-5 text-green-600" /> },
  { type: 'analytics', label: 'Analytics Automation', icon: <BarChart className="h-5 w-5 text-blue-600" /> },
];

export default function AdminIntegrations() {
  const [webhooks, setWebhooks] = useState({});
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [testing, setTesting] = useState({});
  const [testResult, setTestResult] = useState({});

  useEffect(() => {
    // Fetch webhook URLs and status from DB
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('n8n_webhooks').select('*');
      if (data) {
        const map = {};
        const stat = {};
        data.forEach(row => {
          map[row.type] = row.url;
          stat[row.type] = {
            last_status: row.last_status,
            last_called_at: row.last_called_at,
            last_error: row.last_error
          };
        });
        setWebhooks(map);
        setStatus(stat);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async (type) => {
    setSaving(s => ({ ...s, [type]: true }));
    const url = webhooks[type];
    // Upsert webhook URL
    await supabase.from('n8n_webhooks').upsert({ type, url, updated_at: new Date().toISOString() }, { onConflict: 'type' });
    setSaving(s => ({ ...s, [type]: false }));
  };

  const handleTest = async (type) => {
    setTesting(t => ({ ...t, [type]: true }));
    setTestResult(r => ({ ...r, [type]: undefined }));
    const url = webhooks[type];
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, type, timestamp: new Date().toISOString() })
      });
      const text = await res.text();
      setTestResult(r => ({ ...r, [type]: res.ok ? 'Success' : `Error: ${text}` }));
      // Update status in DB
      await supabase.from('n8n_webhooks').update({
        last_status: res.ok ? 'success' : 'error',
        last_called_at: new Date().toISOString(),
        last_error: res.ok ? null : text,
        updated_at: new Date().toISOString()
      }).eq('type', type);
      setStatus(s => ({ ...s, [type]: {
        last_status: res.ok ? 'success' : 'error',
        last_called_at: new Date().toISOString(),
        last_error: res.ok ? null : text
      }}));
    } catch (e) {
      setTestResult(r => ({ ...r, [type]: `Error: ${e.message}` }));
      await supabase.from('n8n_webhooks').update({
        last_status: 'error',
        last_called_at: new Date().toISOString(),
        last_error: e.message,
        updated_at: new Date().toISOString()
      }).eq('type', type);
      setStatus(s => ({ ...s, [type]: {
        last_status: 'error',
        last_called_at: new Date().toISOString(),
        last_error: e.message
      }}));
    }
    setTesting(t => ({ ...t, [type]: false }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Integration Settings</h1>
            <p className="text-purple-100">Configure payment gateways, email services, and n8n automation</p>
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
            <div className="text-lg font-bold text-purple-800">n8n Automation</div>
            <div className="text-sm text-purple-600">Workflow Automation</div>
          </CardContent>
        </Card>
      </div>

      {/* n8n Automation Webhook Management */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>n8n Automation Webhooks</CardTitle>
          <CardDescription>Configure and test n8n workflow webhooks for automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {WEBHOOK_TYPES.map(({ type, label, icon }) => (
            <div key={type} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">{icon}<span className="font-semibold">{label}</span></div>
              <div className="flex gap-2 items-center">
                <Input
                  value={webhooks[type] || ''}
                  onChange={e => setWebhooks(w => ({ ...w, [type]: e.target.value }))}
                  placeholder={`https://n8n.yourdomain.com/webhook/${type}`}
                  className="font-mono text-sm flex-1"
                  disabled={loading}
                />
                <Button onClick={() => handleSave(type)} disabled={saving[type] || loading} size="sm">
                  {saving[type] ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={() => handleTest(type)} disabled={testing[type] || !webhooks[type]} size="sm" variant="outline">
                  {testing[type] ? 'Testing...' : 'Test Webhook'}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {status[type]?.last_status && (
                  <span className={status[type].last_status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    Last status: {status[type].last_status}
                  </span>
                )}
                {status[type]?.last_called_at && (
                  <> | Last called: {new Date(status[type].last_called_at).toLocaleString()}</>
                )}
                {status[type]?.last_error && (
                  <><br/>Error: <span className="text-red-600">{status[type].last_error}</span></>
                )}
                {testResult[type] && (
                  <><br/>Test result: <span className={testResult[type].startsWith('Success') ? 'text-green-600' : 'text-red-600'}>{testResult[type]}</span></>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>n8n Setup Instructions</CardTitle>
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
}
