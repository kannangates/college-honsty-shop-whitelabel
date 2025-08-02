import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { Shield, QrCode, Smartphone, Key, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export const MFASetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkMFAStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/mfa/status');
      const data = await response.json();
      setIsEnabled(data.enabled);
    } catch (error) {
      console.error('Error checking MFA status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check MFA status',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      checkMFAStatus();
    }
  }, [user, checkMFAStatus]);

  const setupMFA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set up MFA');
      }

      const { qrCode } = await response.json();
      setQrCode(qrCode);
      setIsVerifying(true);
    } catch (error) {
      console.error('Error setting up MFA:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set up MFA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a verification code',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify MFA');
      }

      await checkMFAStatus();
      setIsVerifying(false);
      setVerificationCode('');

      toast({
        title: 'Success',
        description: 'MFA has been enabled successfully',
      });
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable MFA');
      }

      await checkMFAStatus();
      setQrCode('');
      setIsVerifying(false);

      toast({
        title: 'Success',
        description: 'MFA has been disabled',
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disable MFA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Two-factor authentication is enabled</span>
            </div>
            <Button
              variant="destructive"
              onClick={disableMFA}
              disabled={isLoading}
            >
              {isLoading ? 'Disabling...' : 'Disable MFA'}
            </Button>
          </div>
        ) : isVerifying ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-center">
                {qrCode ? (
                  <div className="rounded-lg border p-4">
                    <Image
                      src={qrCode}
                      alt="MFA QR Code"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-lg border">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={verifyMFA}
                disabled={verificationCode.length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify and Enable'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsVerifying(false);
                  setQrCode('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Authenticator App</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to get verification codes
              </p>
            </div>

            <Button
              onClick={setupMFA}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Setting up...' : 'Set up authenticator app'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
