import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { whitelabelService, WhitelabelConfig } from '@/services/whitelabelService';
import { Loader2, Save, RefreshCw } from 'lucide-react';

const defaultConfig: WhitelabelConfig = {
  app: {
    name: "College Honesty Shop",
    welcome_points: 100,
    tagline: "No Cameras 📷 | No Cashiers 💳 | Just Character 🫡",
    subtitle: "🛡️ Honor in Every Transaction 🤝",
    description: "A modern, secure, and ISO-compliant honesty shop management system built with enterprise-grade security and performance optimization."
  },
  branding: {
    college_name: "Your College Name",
    portal_name: "Your College Honesty Shop Portal",
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#f1f5f9"
    },
    logo: {
      url: "/logo.png",
      fallback: "https://cdn.jsdelivr.net/gh/lucide-icons/lucide@0.263.1/icons/graduation-cap.svg"
    },
    favicon: "/logo.png"
  },
  forms: {
    labels: {
      student_id: "Student ID",
      full_name: "Full Name",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      mobile_number: "Mobile Number",
      department: "Department",
      shift: "Shift",
      role: "Role",
      welcome_points: "Welcome Points"
    },
    placeholders: {
      student_id: "Enter your Student ID",
      full_name: "Enter your full name",
      email: "Enter your email",
      password: "Enter your password",
      confirm_password: "Confirm your password",
      mobile_number: "Enter your mobile number"
    },
    shift_options: [
      { value: "Morning (1st Shift)", label: "Morning (1st Shift)" },
      { value: "Evening (2nd Shift)", label: "Evening (2nd Shift)" },
      { value: "Full Shift", label: "Full Shift" }
    ],
    role_options: [
      { value: "student", label: "Student" },
      { value: "teacher", label: "Teacher" }
    ]
  },
  messages: {
    auth: {
      login_description: "Enter your Student ID and password to access the portal",
      signup_description: "Create your account to access the portal",
      login_button: "Sign In 🚀",
      signup_button: "Create Account 🚀",
      welcome_back: "Welcome back! 🎉",
      account_created: "Account created! 🎉",
      sign_in_success: "You're successfully logged in!",
      fill_all_fields: "Please fill in all required fields",
      errors: {
        missing_student_id: "Student ID is required",
        student_id_alphanumeric: "Only letters and numbers allowed",
        missing_credentials: "Password is required",
        password_min_length: "Password must be at least 6 characters",
        ensure_passwords_match: "Passwords do not match",
        session_expired: "Session expired, please login again",
        login_failed: "Login failed"
      }
    },
    navigation: {
      header_title: "College Honesty Shop",
      notifications: "Notifications",
      no_notifications: "No notifications"
    },
    products: {
      no_products: "No products available",
      out_of_stock: "Out of Stock",
      add_to_cart: "Add to Cart",
      total: "Total",
      check_back: "Check back later for new products",
      loading_products: "Loading products..."
    },
    errors: {
      all_fields_required: "All fields required",
      fill_all_fields: "Please fill in all required fields",
      passwords_dont_match: "Passwords don't match",
      password_too_short: "Password too short",
      missing_credentials: "Missing credentials",
      login_failed: "Login failed",
      signup_failed: "Signup failed",
      student_id_alphanumeric: "Only letters and numbers are allowed",
      student_id_not_found: "Student ID not found",
      session_expired: "Session expired, please login again",
      network_error: "Network error, please try again",
      missing_student_id: "Student ID is required",
      password_min_length: "Password must be at least 6 characters",
      ensure_passwords_match: "Please ensure passwords match",
      failed_to_load_image: "Failed to load image",
      failedToLoadStockOperations: "Failed to load stock operations",
      failedToSaveStockOperations: "Failed to save stock operations"
    },
    loading: {
      signing_in: "Signing in... ⏳",
      creating_account: "Creating Account... ⏳",
      loading_products: "Loading products...",
      loading_image: "Loading image..."
    },
    success: {
      password_reset_sent: "Password Reset",
      reset_link_sent: "Password reset link sent to:"
    }
  },
  system: {
    performance: {
      cache_timeout: 300000,
      max_login_attempts: 5,
      session_timeout: 86400000,
      image_retry_attempts: 3,
      image_retry_delay: 1000
    },
    security: {
      enable_csrf_protection: true,
      enable_xss_protection: true,
      enable_rate_limiting: true,
      session_validation_interval: 300000,
      audit_log_retention: 7776000000
    },
    iso_compliance: {
      enable_audit_logging: true,
      enable_performance_monitoring: true,
      enable_security_monitoring: true,
      enable_quality_assurance: true,
      compliance_check_interval: 86400000
    }
  },
  SECURITY: {
    session_validation_interval: 300000
  },
  badge_images: {
    achievement_badge: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/award.svg",
    honor_badge: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/trophy.svg",
    excellence_badge: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/star.svg"
  },
  admin: {
    access_note: "Super Admin Access: Check with Radhika"
  }
};

export default function WhitelabelConfigForm() {
  const [config, setConfig] = useState<WhitelabelConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await whitelabelService.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await whitelabelService.updateConfig(config);
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: string | number | boolean) => {
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current: Record<string, unknown> = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Whitelabel Configuration</h2>
        <div className="flex gap-2">
          <Button onClick={fetchConfig} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="app" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="app">App</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* App Configuration */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="app.name">App Name</Label>
                  <Input
                    id="app.name"
                    value={config.app.name}
                    onChange={(e) => updateConfig('app.name', e.target.value)}
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
                <Label htmlFor="app.description">Description</Label>
                <Textarea
                  id="app.description"
                  value={config.app.description}
                  onChange={(e) => updateConfig('app.description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Configuration */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="branding.colors.primary">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="branding.colors.primary"
                      value={config.branding.colors.primary}
                      onChange={(e) => updateConfig('branding.colors.primary', e.target.value)}
                    />
                    <Input
                      type="color"
                      value={config.branding.colors.primary}
                      onChange={(e) => updateConfig('branding.colors.primary', e.target.value)}
                      className="w-12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="branding.colors.secondary">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="branding.colors.secondary"
                      value={config.branding.colors.secondary}
                      onChange={(e) => updateConfig('branding.colors.secondary', e.target.value)}
                    />
                    <Input
                      type="color"
                      value={config.branding.colors.secondary}
                      onChange={(e) => updateConfig('branding.colors.secondary', e.target.value)}
                      className="w-12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="branding.colors.accent">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="branding.colors.accent"
                      value={config.branding.colors.accent}
                      onChange={(e) => updateConfig('branding.colors.accent', e.target.value)}
                    />
                    <Input
                      type="color"
                      value={config.branding.colors.accent}
                      onChange={(e) => updateConfig('branding.colors.accent', e.target.value)}
                      className="w-12"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branding.logo.url">Logo URL</Label>
                  <Input
                    id="branding.logo.url"
                    value={config.branding.logo.url}
                    onChange={(e) => updateConfig('branding.logo.url', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="branding.logo.fallback">Logo Fallback URL</Label>
                  <Input
                    id="branding.logo.fallback"
                    value={config.branding.logo.fallback}
                    onChange={(e) => updateConfig('branding.logo.fallback', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="branding.favicon">Favicon URL</Label>
                <Input
                  id="branding.favicon"
                  value={config.branding.favicon}
                  onChange={(e) => updateConfig('branding.favicon', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Configuration */}
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="forms.labels.student_id">Student ID Label</Label>
                  <Input
                    id="forms.labels.student_id"
                    value={config.forms.labels.student_id}
                    onChange={(e) => updateConfig('forms.labels.student_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forms.labels.full_name">Full Name Label</Label>
                  <Input
                    id="forms.labels.full_name"
                    value={config.forms.labels.full_name}
                    onChange={(e) => updateConfig('forms.labels.full_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forms.labels.email">Email Label</Label>
                  <Input
                    id="forms.labels.email"
                    value={config.forms.labels.email}
                    onChange={(e) => updateConfig('forms.labels.email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forms.labels.password">Password Label</Label>
                  <Input
                    id="forms.labels.password"
                    value={config.forms.labels.password}
                    onChange={(e) => updateConfig('forms.labels.password', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Placeholders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="forms.placeholders.student_id">Student ID Placeholder</Label>
                  <Input
                    id="forms.placeholders.student_id"
                    value={config.forms.placeholders.student_id}
                    onChange={(e) => updateConfig('forms.placeholders.student_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forms.placeholders.full_name">Full Name Placeholder</Label>
                  <Input
                    id="forms.placeholders.full_name"
                    value={config.forms.placeholders.full_name}
                    onChange={(e) => updateConfig('forms.placeholders.full_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forms.placeholders.email">Email Placeholder</Label>
                  <Input
                    id="forms.placeholders.email"
                    value={config.forms.placeholders.email}
                    onChange={(e) => updateConfig('forms.placeholders.email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forms.placeholders.password">Password Placeholder</Label>
                  <Input
                    id="forms.placeholders.password"
                    value={config.forms.placeholders.password}
                    onChange={(e) => updateConfig('forms.placeholders.password', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Configuration */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messages.auth.login_description">Login Description</Label>
                  <Textarea
                    id="messages.auth.login_description"
                    value={config.messages.auth.login_description}
                    onChange={(e) => updateConfig('messages.auth.login_description', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="messages.auth.signup_description">Signup Description</Label>
                  <Textarea
                    id="messages.auth.signup_description"
                    value={config.messages.auth.signup_description}
                    onChange={(e) => updateConfig('messages.auth.signup_description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messages.auth.login_button">Login Button Text</Label>
                  <Input
                    id="messages.auth.login_button"
                    value={config.messages.auth.login_button}
                    onChange={(e) => updateConfig('messages.auth.login_button', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="messages.auth.signup_button">Signup Button Text</Label>
                  <Input
                    id="messages.auth.signup_button"
                    value={config.messages.auth.signup_button}
                    onChange={(e) => updateConfig('messages.auth.signup_button', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messages.errors.login_failed">Login Failed Message</Label>
                  <Input
                    id="messages.errors.login_failed"
                    value={config.messages.errors.login_failed}
                    onChange={(e) => updateConfig('messages.errors.login_failed', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="messages.errors.signup_failed">Signup Failed Message</Label>
                  <Input
                    id="messages.errors.signup_failed"
                    value={config.messages.errors.signup_failed}
                    onChange={(e) => updateConfig('messages.errors.signup_failed', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="system.performance.cache_timeout">Cache Timeout (ms)</Label>
                  <Input
                    id="system.performance.cache_timeout"
                    type="number"
                    value={config.system.performance.cache_timeout}
                    onChange={(e) => updateConfig('system.performance.cache_timeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="system.performance.max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="system.performance.max_login_attempts"
                    type="number"
                    value={config.system.performance.max_login_attempts}
                    onChange={(e) => updateConfig('system.performance.max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="system.security.enable_csrf_protection"
                  checked={config.system.security.enable_csrf_protection}
                  onCheckedChange={(checked) => updateConfig('system.security.enable_csrf_protection', checked)}
                />
                <Label htmlFor="system.security.enable_csrf_protection">Enable CSRF Protection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="system.security.enable_xss_protection"
                  checked={config.system.security.enable_xss_protection}
                  onCheckedChange={(checked) => updateConfig('system.security.enable_xss_protection', checked)}
                />
                <Label htmlFor="system.security.enable_xss_protection">Enable XSS Protection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="system.security.enable_rate_limiting"
                  checked={config.system.security.enable_rate_limiting}
                  onCheckedChange={(checked) => updateConfig('system.security.enable_rate_limiting', checked)}
                />
                <Label htmlFor="system.security.enable_rate_limiting">Enable Rate Limiting</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ISO Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="system.iso_compliance.enable_audit_logging"
                  checked={config.system.iso_compliance.enable_audit_logging}
                  onCheckedChange={(checked) => updateConfig('system.iso_compliance.enable_audit_logging', checked)}
                />
                <Label htmlFor="system.iso_compliance.enable_audit_logging">Enable Audit Logging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="system.iso_compliance.enable_performance_monitoring"
                  checked={config.system.iso_compliance.enable_performance_monitoring}
                  onCheckedChange={(checked) => updateConfig('system.iso_compliance.enable_performance_monitoring', checked)}
                />
                <Label htmlFor="system.iso_compliance.enable_performance_monitoring">Enable Performance Monitoring</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Configuration */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badge Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge_images.achievement_badge">Achievement Badge URL</Label>
                  <Input
                    id="badge_images.achievement_badge"
                    value={config.badge_images.achievement_badge}
                    onChange={(e) => updateConfig('badge_images.achievement_badge', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="badge_images.honor_badge">Honor Badge URL</Label>
                  <Input
                    id="badge_images.honor_badge"
                    value={config.badge_images.honor_badge}
                    onChange={(e) => updateConfig('badge_images.honor_badge', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="badge_images.excellence_badge">Excellence Badge URL</Label>
                  <Input
                    id="badge_images.excellence_badge"
                    value={config.badge_images.excellence_badge}
                    onChange={(e) => updateConfig('badge_images.excellence_badge', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 