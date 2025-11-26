import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WHITELABEL_CONFIG } from '@/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WhitelabelConfig = () => {
  const [editableConfig, setEditableConfig] = useState('');
  const [fullConfig, setFullConfig] = useState<typeof WHITELABEL_CONFIG | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const { toast } = useToast();

  const parsedResult = useMemo(() => {
    try {
      return {
        data: editableConfig ? JSON.parse(editableConfig) : {},
        isValid: true
      };
    } catch (error) {
      return {
        data: null,
        isValid: false
      };
    }
  }, [editableConfig]);

  const currentUpiValue = parsedResult.isValid
    ? parsedResult.data?.app?.payment?.upi?.vpa ?? ''
    : '';

  useEffect(() => {
    if (parsedResult.isValid) {
      setUpiInput(currentUpiValue);
    }
  }, [parsedResult.isValid, currentUpiValue]);

  type MutableConfig = Record<string, any>;

  const updateEditableConfig = (updater: (config: MutableConfig) => void) => {
    setEditableConfig(prev => {
      try {
        const parsed: MutableConfig = prev ? JSON.parse(prev) : {};
        updater(parsed);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please fix the JSON above before using helpers.',
          variant: 'destructive',
        });
        return prev;
      }
    });
  };

  const handleApplyUpi = () => {
    if (!parsedResult.isValid) {
      toast({
        title: 'Invalid JSON',
        description: 'Fix the JSON contents before updating payment settings.',
        variant: 'destructive',
      });
      return;
    }

    const trimmed = upiInput.trim();
    if (!trimmed) {
      toast({
        title: 'UPI ID required',
        description: 'Enter a valid UPI ID before syncing to the config.',
        variant: 'destructive',
      });
      return;
    }

    updateEditableConfig(config => {
      if (typeof config.app !== 'object' || config.app === null) {
        config.app = {};
      }
      const appConfig = config.app as MutableConfig;

      if (typeof appConfig.payment !== 'object' || appConfig.payment === null) {
        appConfig.payment = {};
      }
      const paymentConfig = appConfig.payment as MutableConfig;

      if (typeof paymentConfig.upi !== 'object' || paymentConfig.upi === null) {
        paymentConfig.upi = {};
      }
      const upiConfig = paymentConfig.upi as MutableConfig;

      upiConfig.vpa = trimmed;
    });

    toast({
      title: 'UPI ID updated',
      description: 'Remember to click "Save Changes" to persist this update.',
    });
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      setFullConfig(WHITELABEL_CONFIG);
      // Only show app and branding sections for editing
      const editableSections = {
        app: WHITELABEL_CONFIG.app,
        branding: WHITELABEL_CONFIG.branding,
      };
      setEditableConfig(JSON.stringify(editableSections, null, 2));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Validate JSON first
      const parsedEditableConfig = JSON.parse(editableConfig);

      // Validate that only app and branding are present
      const allowedKeys = ['app', 'branding'];
      const providedKeys = Object.keys(parsedEditableConfig);
      const invalidKeys = providedKeys.filter(key => !allowedKeys.includes(key));

      if (invalidKeys.length > 0) {
        throw new Error(`Only "app" and "branding" sections can be edited. Found: ${invalidKeys.join(', ')}`);
      }

      // Merge with the full config (keeping other sections unchanged)
      const mergedConfig = {
        ...fullConfig,
        app: parsedEditableConfig.app,
        branding: parsedEditableConfig.branding,
      };

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Send to backend API to update the file
      const response = await fetch('/api/whitelabel/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ config: mergedConfig }),
      });

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Server error details:', errorData);
          throw new Error(errorData.error || 'Failed to update configuration');
        } else {
          const textError = await response.text();
          console.error('Server error (non-JSON):', textError);
          throw new Error(`Server error: ${response.status}. Make sure the server is running on port 8080 with 'npm run dev'`);
        }
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: result.message || 'Configuration updated successfully. Please restart the server to apply changes.',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      if (error instanceof SyntaxError) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your JSON syntax',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save configuration',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Whitelabel Configuration (JSON Editor)</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadConfig} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Reload'}
              </Button>
              <Button onClick={saveConfig} disabled={saving || loading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Restricted Editor:</strong> You can only edit the "app" and "branding" sections.
              All other configuration sections (forms, messages, system, etc.) are protected and cannot be modified here.
              Use the <code>app.payment</code> block to switch payment experiences (e.g., <code>"experience": "dynamic_qr"</code>) or to update UPI details for the QR code.
            </div>
          </div>
          <div className="mb-6 rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="upi-vpa">UPI ID / VPA</Label>
                <Input
                  id="upi-vpa"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  placeholder="example@upi"
                  disabled={loading}
                />
                {!parsedResult.isValid && (
                  <p className="text-xs text-red-600">Fix JSON syntax above to edit payment settings here.</p>
                )}
              </div>
              <Button
                onClick={handleApplyUpi}
                disabled={loading || saving || !upiInput.trim()}
              >
                Apply to JSON
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This helper writes to <code>app.payment.upi.vpa</code>. Changes are only saved permanently after you click "Save Changes" above.
            </p>
          </div>
          <Textarea
            value={editableConfig}
            onChange={(e) => setEditableConfig(e.target.value)}
            className="min-h-[600px] font-mono text-sm"
            placeholder="Loading configuration..."
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Edit only the "app" and "branding" sections above. Click "Save Changes" to update the whitelabel.json file.
            You'll need to restart the server to see the changes take effect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhitelabelConfig;