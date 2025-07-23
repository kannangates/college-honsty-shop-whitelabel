import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { whitelabelService, WhitelabelConfig } from '@/services/whitelabelService';
import { Save, RefreshCw } from 'lucide-react';

const defaultConfig: WhitelabelConfig = {
  app: {
    name: "College Store",
    welcome_points: 100,
    tagline: "Your College Store",
    subtitle: "Shop with ease",
    description: "Welcome to your college store"
  },
  branding: {
    college_name: "College Name",
    portal_name: "College Store Portal",
    colors: {
      primary: "#202072",
      secondary: "#e66166", 
      accent: "#f0f0f0"
    },
    logo: {
      url: "/logo.png",
      fallback: "/placeholder.svg"
    },
    favicon: "/favicon.ico"
  }
};

export default function WhitelabelConfigForm() {
  const [config, setConfig] = useState<WhitelabelConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await whitelabelService.getConfig();
      setConfig(data);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await whitelabelService.updateConfig(config);
      toast({
        title: 'Success',
        description: result.message || 'Configuration updated successfully',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Whitelabel Configuration</h2>
        <div className="flex gap-2">
          <Button onClick={loadConfig} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>App Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="app.name">App Name</Label>
              <Input
                id="app.name"
                value={config.app.name}
                onChange={(e) => updateConfig('app.name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="app.tagline">Tagline</Label>
              <Input
                id="app.tagline"
                value={config.app.tagline}
                onChange={(e) => updateConfig('app.tagline', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="app.subtitle">Subtitle</Label>
              <Input
                id="app.subtitle"
                value={config.app.subtitle}
                onChange={(e) => updateConfig('app.subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="app.welcome_points">Welcome Points</Label>
              <Input
                id="app.welcome_points"
                type="number"
                value={config.app.welcome_points}
                onChange={(e) => updateConfig('app.welcome_points', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="branding.college_name">College Name</Label>
              <Input
                id="branding.college_name"
                value={config.branding.college_name}
                onChange={(e) => updateConfig('branding.college_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branding.portal_name">Portal Name</Label>
              <Input
                id="branding.portal_name"
                value={config.branding.portal_name}
                onChange={(e) => updateConfig('branding.portal_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branding.colors.primary">Primary Color</Label>
              <Input
                id="branding.colors.primary"
                type="color"
                value={config.branding.colors.primary}
                onChange={(e) => updateConfig('branding.colors.primary', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branding.colors.secondary">Secondary Color</Label>
              <Input
                id="branding.colors.secondary"
                type="color"
                value={config.branding.colors.secondary}
                onChange={(e) => updateConfig('branding.colors.secondary', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branding.logo.url">Logo URL</Label>
              <Input
                id="branding.logo.url"
                value={config.branding.logo.url}
                onChange={(e) => updateConfig('branding.logo.url', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}