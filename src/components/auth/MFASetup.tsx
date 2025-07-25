
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { Shield, QrCode, Smartphone, Key, CheckCircle } from 'lucide-react';

export const MFASetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkMFAStatus();
    }
  }, [user]);

  const checkMFAStatus = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setIsEnabled(factors?.totp && factors.totp.length > 0);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `${profile?.name || 'User'}'s Authenticator`
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setIsVerifying(true);

      toast({
        title: 'MFA Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup MFA';
      toast({
        title: 'Setup Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter the verification code from your authenticator app',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, get the list of factors
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) throw new Error('No MFA factor found. Please try setting up MFA again.');

      // First, verify the code with the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      });

      if (challengeError) throw challengeError;

      // Then verify the challenge with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (verifyError) throw verifyError;

      // Verify that MFA is now enabled
      const { data: updatedFactors, error: updatedFactorsError } = await supabase.auth.mfa.listFactors();
      if (updatedFactorsError) throw updatedFactorsError;

      const isMFAEnabled = updatedFactors?.totp?.some(factor => factor.status === 'verified');
      if (!isMFAEnabled) {
        throw new Error('MFA verification was not successful. Please try again.');
      }

      setIsEnabled(true);
      setIsVerifying(false);
      setVerificationCode('');
      
      toast({
        title: 'MFA Enabled',
        description: 'Two-factor authentication has been successfully enabled',
      });
    } catch (error: unknown) {
      console.error('MFA Verification Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const disableMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (!factors?.totp?.[0]) return;

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factors.totp[0].id
      });

      if (error) throw error;

      setIsEnabled(false);
      setIsVerifying(false);
      setQrCode('');
      setSecret('');

      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (isEnabled) {
    return (
      <Card className="border-0 shadow-lg bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            MFA Enabled
          </CardTitle>
          <CardDescription>
            Two-factor authentication is active on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Shield className="h-4 w-4" />
              Your account is protected with 2FA
            </div>
            <Button
              onClick={disableMFA}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Disable MFA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isVerifying) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Verify Setup
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qrCode && (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Scan with Google Authenticator, Authy, or similar app
                </p>
              </div>
            )}

            {secret && (
              <div className="bg-gray-50 p-3 rounded border">
                <Label className="text-xs font-medium text-gray-700">Manual Entry Key:</Label>
                <code className="text-sm font-mono block mt-1">{secret}</code>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={verifyMFA} className="flex-1">
                <Key className="h-4 w-4 mr-2" />
                Verify & Enable
              </Button>
              <Button 
                onClick={() => setIsVerifying(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <QrCode className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Enhanced Security</p>
              <p className="text-gray-600">Protect your account with Google Authenticator or similar TOTP apps</p>
            </div>
          </div>

          <Button onClick={enrollMFA} className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Enable Two-Factor Authentication
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
