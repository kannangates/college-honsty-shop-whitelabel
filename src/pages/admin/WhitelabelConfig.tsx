import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WHITELABEL_CONFIG } from '@/config';

const WhitelabelConfig = () => {
  const [editableConfig, setEditableConfig] = useState('');
  const [fullConfig, setFullConfig] = useState<typeof WHITELABEL_CONFIG | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

      // Save directly to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingConfig } = await (supabase as any)
        .from('whitelabel_config')
        .select('id')
        .limit(1)
        .single();

      if (existingConfig) {
        // Update existing config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('whitelabel_config')
          .update({
            config: mergedConfig,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        // Insert new config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('whitelabel_config')
          .insert({ config: mergedConfig });

        if (error) throw error;
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
            </div>
          </div>
          <Textarea
            value={editableConfig}
            onChange={(e) => setEditableConfig(e.target.value)}
            className="min-h-[600px] font-mono text-sm"
            placeholder="Loading configuration..."
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Edit only the "app" and "branding" sections above. Changes will take effect after saving and refreshing the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhitelabelConfig;