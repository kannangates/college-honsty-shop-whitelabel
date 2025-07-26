import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Webhook, Trophy, Award, Bell, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WEBHOOK_TYPES = [
  { type: 'points', label: 'Points Automation', icon: <Trophy className="h-5 w-5 text-yellow-600" /> },
  { type: 'badge', label: 'Badge Automation', icon: <Award className="h-5 w-5 text-purple-600" /> },
  { type: 'notification', label: 'Notification Automation', icon: <Bell className="h-5 w-5 text-green-600" /> },
  { type: 'analytics', label: 'Analytics Automation', icon: <BarChart className="h-5 w-5 text-blue-600" /> },
];

export default function AdminN8nPage() {
  const [webhooks, setWebhooks] = useState<Record<string, string>>({});
  interface WebhookStatus {
    last_status?: string;
    last_called_at?: string;
    last_error?: string | null;
    updated_at?: string;
  }

  const [status, setStatus] = useState<Record<string, WebhookStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('n8n_webhooks').select('*');
    if (data) {
      const map: Record<string, string> = {};
      const stat: Record<string, WebhookStatus> = {};
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
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleSave = async (type: string) => {
    setSaving(s => ({ ...s, [type]: true }));
    const url = webhooks[type];
    await supabase.from('n8n_webhooks').upsert(
      { 
        type, 
        url, 
        updated_at: new Date().toISOString() 
      }, 
      { onConflict: 'type' }
    );
    setSaving(s => ({ ...s, [type]: false }));
  };

  const handleTest = async (type: string) => {
    setTesting(t => ({ ...t, [type]: true }));
    setTestResult(r => ({ ...r, [type]: '' }));
    const url = webhooks[type];
    
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setTestResult(r => ({ ...r, [type]: 'Test successful!' }));
        await updateWebhookStatus(type, 'success');
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      setTestResult(r => ({ ...r, [type]: `Error: ${errorMessage}` }));
      await updateWebhookStatus(type, 'error', errorMessage);
    } finally {
      setTesting(t => ({ ...t, [type]: false }));
    }
  };

  const updateWebhookStatus = async (type: string, status: 'success' | 'error', error?: string) => {
    const updateData = {
      last_status: status,
      last_called_at: new Date().toISOString(),
      last_error: error || null,
      updated_at: new Date().toISOString()
    };
    
    await supabase
      .from('n8n_webhooks')
      .update(updateData)
      .eq('type', type);
      
    setStatus(s => ({ 
      ...s, 
      [type]: {
        ...s[type],
        ...updateData
      } 
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Webhook className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">n8n Automation Settings</h1>
            <p className="text-purple-100">Configure payment gateways, email services, and n8n automation</p>
          </div>
        </div>
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
              <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="font-semibold">{label}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  value={webhooks[type] || ''}
                  onChange={e => setWebhooks(w => ({ ...w, [type]: e.target.value }))}
                  placeholder={`https://n8n.yourdomain.com/webhook/${type}`}
                  className="font-mono text-sm flex-1"
                  disabled={loading}
                />
                <Button 
                  onClick={() => handleSave(type)} 
                  disabled={saving[type] || loading} 
                  size="sm"
                >
                  {saving[type] ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={() => handleTest(type)} 
                  disabled={testing[type] || !webhooks[type]} 
                  size="sm" 
                  variant="outline"
                >
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
                  <span> | Last called: {new Date(status[type].last_called_at).toLocaleString()}</span>
                )}
                {status[type]?.last_error && (
                  <div className="mt-1">
                    <span className="text-red-600">Error: {status[type].last_error}</span>
                  </div>
                )}
                {testResult[type] && (
                  <div className="mt-1">
                    <span className={testResult[type].startsWith('Error') ? 'text-red-600' : 'text-green-600'}>
                      {testResult[type]}
                    </span>
                  </div>
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
