
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Save } from 'lucide-react';

interface IntegrationSettings {
  id: string;
  payment_qr_url?: string;
  razorpay_api_key_hash?: string;
  razorpay_webhook_url?: string;
  gmail_user_hash?: string;
  gmail_client_id_hash?: string;
  gmail_client_secret_hash?: string;
  gmail_refresh_token_hash?: string;
}

export const IntegrationSettingsDisplay = () => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<IntegrationSettings>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching integration settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch integration settings',
          variant: 'destructive',
        });
      } else {
        setSettings(data);
        setFormData(data || {});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskValue = (value: string | null | undefined): string => {
    if (!value) return 'Not set';
    if (value.length <= 4) return '****';
    return value.substring(0, 2) + '***' + value.substring(value.length - 2);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = settings?.id 
        ? await supabase
            .from('integration_settings')
            .update(formData)
            .eq('id', settings.id)
        : await supabase
            .from('integration_settings')
            .insert([formData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Integration settings updated successfully',
      });
      
      setEditMode(false);
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save integration settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading integration settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Integration Settings</CardTitle>
            <CardDescription>Manage payment and email integration settings</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSecrets(!showSecrets)}
              size="sm"
            >
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSecrets ? 'Hide' : 'Show'} Values
            </Button>
            <Button
              onClick={() => setEditMode(!editMode)}
              size="sm"
            >
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Payment Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Payment QR URL</Label>
              {editMode ? (
                <Textarea
                  value={formData.payment_qr_url || ''}
                  onChange={(e) => setFormData({...formData, payment_qr_url: e.target.value})}
                  placeholder="Enter payment QR URL"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.payment_qr_url ? (
                    showSecrets ? settings.payment_qr_url : maskValue(settings.payment_qr_url)
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Razorpay API Key</Label>
              {editMode ? (
                <Input
                  value={formData.razorpay_api_key_hash || ''}
                  onChange={(e) => setFormData({...formData, razorpay_api_key_hash: e.target.value})}
                  placeholder="Enter Razorpay API key"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.razorpay_api_key_hash ? (
                    <Badge variant="secondary">
                      {showSecrets ? settings.razorpay_api_key_hash : maskValue(settings.razorpay_api_key_hash)}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Razorpay Webhook URL</Label>
              {editMode ? (
                <Input
                  value={formData.razorpay_webhook_url || ''}
                  onChange={(e) => setFormData({...formData, razorpay_webhook_url: e.target.value})}
                  placeholder="Enter webhook URL"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.razorpay_webhook_url || 'Not configured'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Gmail Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Gmail User</Label>
              {editMode ? (
                <Input
                  value={formData.gmail_user_hash || ''}
                  onChange={(e) => setFormData({...formData, gmail_user_hash: e.target.value})}
                  placeholder="Enter Gmail user"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.gmail_user_hash ? (
                    <Badge variant="secondary">
                      {showSecrets ? settings.gmail_user_hash : maskValue(settings.gmail_user_hash)}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Gmail Client ID</Label>
              {editMode ? (
                <Input
                  value={formData.gmail_client_id_hash || ''}
                  onChange={(e) => setFormData({...formData, gmail_client_id_hash: e.target.value})}
                  placeholder="Enter Client ID"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.gmail_client_id_hash ? (
                    <Badge variant="secondary">
                      {showSecrets ? settings.gmail_client_id_hash : maskValue(settings.gmail_client_id_hash)}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Gmail Client Secret</Label>
              {editMode ? (
                <Input
                  value={formData.gmail_client_secret_hash || ''}
                  onChange={(e) => setFormData({...formData, gmail_client_secret_hash: e.target.value})}
                  placeholder="Enter Client Secret"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.gmail_client_secret_hash ? (
                    <Badge variant="secondary">
                      {showSecrets ? settings.gmail_client_secret_hash : maskValue(settings.gmail_client_secret_hash)}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Gmail Refresh Token</Label>
              {editMode ? (
                <Input
                  value={formData.gmail_refresh_token_hash || ''}
                  onChange={(e) => setFormData({...formData, gmail_refresh_token_hash: e.target.value})}
                  placeholder="Enter Refresh Token"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {settings?.gmail_refresh_token_hash ? (
                    <Badge variant="secondary">
                      {showSecrets ? settings.gmail_refresh_token_hash : maskValue(settings.gmail_refresh_token_hash)}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {editMode && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
