import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const IntegrationSettingsDisplay = () => {
  const [settings, setSettings] = useState<{
    id: string;
    enable_security_monitoring: boolean;
    enable_performance_monitoring: boolean;
    enable_audit_logging: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching integration settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('integration_settings')
        .update({ [key]: value })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
      toast({
        title: "Success",
        description: `Setting "${key}" updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: `Failed to update setting "${key}".`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Integration Settings</CardTitle>
        <CardDescription>
          Manage your integration settings here.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="securityMonitoring">Enable Security Monitoring</Label>
          <Switch
            id="securityMonitoring"
            checked={settings?.enable_security_monitoring || false}
            onCheckedChange={(checked) => updateSetting('enable_security_monitoring', checked)}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="performanceMonitoring">Enable Performance Monitoring</Label>
          <Switch
            id="performanceMonitoring"
            checked={settings?.enable_performance_monitoring || false}
            onCheckedChange={(checked) => updateSetting('enable_performance_monitoring', checked)}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="auditLogging">Enable Audit Logging</Label>
          <Switch
            id="auditLogging"
            checked={settings?.enable_audit_logging || false}
            onCheckedChange={(checked) => updateSetting('enable_audit_logging', checked)}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};
