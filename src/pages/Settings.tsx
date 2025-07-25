
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/features/gamification/components/badge';
import { Settings as SettingsIcon, User, Download, Shield, Key } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { MFASetup } from '@/components/auth/MFASetup';
import DepartmentCombobox from '@/components/ui/DepartmentCombobox';

const Settings = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    department: ''
  });
  const [pwdData, setPwdData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        mobile_number: profile.mobile_number || '',
        department: profile.department || ''
      });
    }
  }, [profile]);

  // Validation functions
  const validPhone = (v: string) => /^\d{10,15}$/.test(v.trim());
  const validName = (v: string) => v.trim().length > 1;
  const validDept = (v: string) => v.trim().length > 1;

  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    // Check if any fields have been modified
    const hasChanges = 
      formData.name !== (profile.name || '') ||
      formData.mobile_number !== (profile.mobile_number || '') ||
      formData.department !== (profile.department || '');
    
    if (!hasChanges) {
      toast({ 
        title: "No Changes", 
        description: "No changes detected. Please modify at least one field.", 
        variant: "destructive" 
      });
      return;
    }

    // Only validate fields that are being updated
    const updateData: Record<string, string> = {};
    
    // Validate and include name if changed
    if (formData.name !== (profile.name || '')) {
      if (!validName(formData.name)) {
        toast({ title: "Name Required", description: "Please enter a valid name.", variant: "destructive" });
        return;
      }
      updateData.name = formData.name;
    }
    
    // Validate and include mobile_number if changed
    if (formData.mobile_number !== (profile.mobile_number || '')) {
      if (formData.mobile_number.trim() !== '') { // Only validate if not empty
        if (!validPhone(formData.mobile_number)) {
          toast({ title: "Invalid Phone", description: "Enter a valid mobile number.", variant: "destructive" });
          return;
        }
      }
      updateData.mobile_number = formData.mobile_number;
    }
    
    // Validate and include department if changed
    if (formData.department !== (profile.department || '')) {
      if (!validDept(formData.department)) {
        toast({ title: "Dept Missing", description: "Please provide your department.", variant: "destructive" });
        return;
      }
      updateData.department = formData.department;
    }
    
    // Add timestamp
    updateData.updated_at = new Date().toISOString();
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      updateProfile({
        ...profile,
        ...updateData
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!profile) return;
    if (pwdData.newPassword.length < 6) {
      toast({ title: 'Weak Password', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdData.newPassword });
      if (error) throw error;
      // clear metadata flag
      await supabase.auth.updateUser({ data: { must_change_password: false } });
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setPwdData({ newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMigrationDoc = async () => {
    try {
      const migrationData = {
        user: profile,
        exportDate: new Date().toISOString(),
        migration_notes: 'User profile export for system migration'
      };

      const blob = new Blob([JSON.stringify(migrationData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `migration_doc_${profile?.student_id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Migration Document Generated',
        description: 'Your migration document has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate migration document.',
        variant: 'destructive',
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-screen-2xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <SettingsIcon className="h-8 w-8" />
              Account Settings
            </h1>
            <p className="text-purple-100">Manage your account, security, and preferences</p>
          </div>

          <Button
            onClick={handleGenerateMigrationDoc}
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-white/50 text-white hover:border-white transition-all duration-200 backdrop-blur-md bg-white/20 hover:bg-white/30 shadow hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Generate Migration Doc
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Information - Left Column */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden relative h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300 to-pink-300 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {profile?.name || 'User Profile'}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        <Badge variant="outline">{profile?.role || 'student'}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-4 py-2 bg-white/60 rounded-xl shadow backdrop-blur-sm">
                    <div className="text-lg font-bold text-green-600">#{profile?.student_id}</div>
                    <div className="text-xs text-gray-600">Student ID</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-gray-100 border-0 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-0 rounded-xl bg-white/70 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile_number" className="text-sm font-medium text-gray-700">Mobile Number</Label>
                    <Input
                      id="mobile_number"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      placeholder="Enter your mobile number"
                      className="border-0 rounded-xl bg-white/70 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                    <div className="relative">
                      <Input
                        id="department"
                        value={formData.department || 'Not specified'}
                        readOnly
                        className="border-0 rounded-xl bg-gray-50 cursor-not-allowed text-gray-700"
                        placeholder="Department"
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-3 pointer-events-none">
                        <span className="text-xs text-gray-500">Read-only</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] text-white rounded-xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? 'Updating...' : 'Update Profile ✨'}
                </Button>
              </CardContent>
            </Card>
            {/* Change Password + Account Status - Right Column */}
            <div className="flex flex-col gap-6 h-full">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 overflow-hidden relative flex-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-300 to-pink-300 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={pwdData.newPassword} onChange={(e)=>setPwdData({...pwdData,newPassword:e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={pwdData.confirmPassword} onChange={(e)=>setPwdData({...pwdData,confirmPassword:e.target.value})}/>
                  </div>
                  <Button onClick={handleChangePassword} disabled={loading} className="rounded-xl">
                    {loading? 'Updating...' : 'Submit'}
                  </Button>
                </CardContent>
              </Card>
              {/* Security Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                  <CardDescription>
                  Enhance your account security with two-factor authentication
                </CardDescription>
                </CardHeader>
                <CardContent>
                <MFASetup />
              </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Settings;
