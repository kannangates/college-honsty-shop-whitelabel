import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WhitelabelConfig = () => {
  const [config, setConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/whitelabel.json');
      const data = await response.json();
      setConfig(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error loading config:', error);
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
      const parsedConfig = JSON.parse(config);
      
      // Save to Supabase function which will update the file
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('https://vkuagjkrpbagrchsqmsf.supabase.co/functions/v1/update-whitelabel-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ config: parsedConfig }),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      toast({
        title: 'Success',
        description: 'Configuration updated successfully. Refresh the page to see changes.',
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
          description: 'Failed to save configuration',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadConfig();
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
          <Textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="min-h-[600px] font-mono text-sm"
            placeholder="Loading configuration..."
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Edit the JSON configuration above. Changes will take effect after saving and refreshing the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhitelabelConfig;