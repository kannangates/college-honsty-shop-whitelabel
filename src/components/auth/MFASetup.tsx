import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { Shield, Smartphone, CheckCircle, Settings, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';

export const MFASetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [requireForLogin, setRequireForLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkMFAStatus = useCallback(async () => {
    if (!user) {
      setIsCheckingStatus(false);
      return;
    }

    setIsCheckingStatus(true);
    try {
      // Check MFA status
      const { data: statusData, error } = await supabase.functions.invoke('mfa-status', {
        body: {},
      });

      if (error || (statusData && statusData.error)) {
        const errorMessage = error?.message || statusData?.error || 'Failed to check MFA status';
        throw new Error(errorMessage);
      }

      setIsEnabled(statusData.enabled || false);

      // Check user preference for login requirement from user metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.user_metadata?.mfa_require_for_login !== undefined) {
        setRequireForLogin(authUser.user_metadata.mfa_require_for_login);
      } else {
        setRequireForLogin(true); // Default to true
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
      setIsEnabled(false); // Default to disabled on error

      // Only show toast for non-auth errors to avoid spam
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        toast({
          title: 'Status Check Failed',
          description: 'Could not verify MFA status. Please refresh the page.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsCheckingStatus(false);
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
      const { data: setupData, error } = await supabase.functions.invoke('mfa-setup', {
        body: {},
      });

      if (error || (setupData && setupData.error)) {
        const errorMessage = error?.message || setupData?.error || 'Failed to set up MFA';
        throw new Error(errorMessage);
      }

      setQrCode(setupData.qrCode);
      setIsVerifying(true);

      toast({
        title: 'MFA Setup Started',
        description: 'Scan the QR code with your authenticator app',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error setting up MFA:', error);

      let errorMessage = 'Failed to set up MFA';
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Setup Failed',
        description: errorMessage,
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
      const { data: verifyData, error } = await supabase.functions.invoke('mfa-verify', {
        body: { token: verificationCode },
      });

      // Check if there's an error in the response data (from the function)
      if (error || (verifyData && verifyData.error)) {
        const errorMessage = error?.message || verifyData?.error || 'Invalid verification code';
        throw new Error(errorMessage);
      }

      setIsEnabled(true);
      setIsVerifying(false);
      setVerificationCode('');
      setQrCode('');

      toast({
        title: 'MFA Enabled',
        description: 'Two-factor authentication has been successfully enabled for your account',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error verifying MFA:', error);

      // Extract user-friendly error message
      let errorMessage = 'Invalid verification code';
      if (error instanceof Error) {
        if (error.message.includes('Invalid token')) {
          errorMessage = 'Invalid verification code. Please check your authenticator app and try again.';
        } else if (error.message.includes('MFA not set up')) {
          errorMessage = 'MFA setup not found. Please restart the setup process.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Verification Failed',
        description: errorMessage,
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
      const { data: disableData, error } = await supabase.functions.invoke('mfa-disable', {
        body: {},
      });

      if (error || (disableData && disableData.error)) {
        const errorMessage = error?.message || disableData?.error || 'Failed to disable MFA';
        throw new Error(errorMessage);
      }

      setIsEnabled(false);
      setVerificationCode('');
      setQrCode('');

      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled for your account',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);

      let errorMessage = 'Failed to disable MFA';
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Disable Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginRequirement = async (required: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { mfa_require_for_login: required }
      });

      if (error) throw error;

      setRequireForLogin(required);
      toast({
        title: 'Setting Updated',
        description: `2FA ${required ? 'will be' : 'will not be'} required for login`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating login requirement:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update login requirement setting',
        variant: 'destructive',
      });
    }
  };

  // Show loading state
  if (isLoading || isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" text={isCheckingStatus ? "Checking status..." : "Processing..."} />
      </div>
    );
  }

  // Show setup flow when verifying
  if (isVerifying) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {qrCode ? (
              <div className="rounded-lg border-2 border-gray-200 p-4 bg-white">
                <img
                  src={qrCode}
                  alt="MFA QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-gray-200">
                <LoadingSpinner size="sm" text="" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">Scan QR Code</p>
            <p className="text-sm text-gray-600">
              Use Google Authenticator, Authy, or any TOTP app to scan this code
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification-code" className="text-sm font-medium">
            Enter Verification Code
          </Label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="font-mono text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsVerifying(false);
              setQrCode('');
              setVerificationCode('');
            }}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={verifyMFA}
            disabled={verificationCode.length !== 6 || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Verifying...' : 'Enable 2FA'}
          </Button>
        </div>
      </div>
    );
  }

  // Show setup button when 2FA is not enabled
  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">How 2FA Works</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Install an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>• Scan the QR code we'll provide</li>
              <li>• Enter codes from your app when logging in</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={setupMFA}
          disabled={isLoading || isCheckingStatus}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
        </Button>
      </div>
    );
  }

  // Main toggle interface when 2FA is enabled
  return (
    <div className="space-y-4">
      {/* First Row: 2FA Status Toggle */}
      <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${isEnabled
        ? 'bg-green-50 border-green-200 shadow-sm'
        : 'bg-red-50 border-red-200'
        }`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className={`h-4 w-4 ${isEnabled ? 'text-green-600' : 'text-red-500'}`} />
            <span className={`font-medium ${isEnabled ? 'text-green-900' : 'text-red-900'}`}>
              {isEnabled ? '2FA is Active' : '2FA is Inactive'}
            </span>
          </div>
          <p className={`text-sm ${isEnabled ? 'text-green-700' : 'text-red-600'}`}>
            {isEnabled
              ? 'Your account is protected with two-factor authentication'
              : 'Your account is not protected with two-factor authentication'
            }
          </p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => {
            if (!checked) {
              setShowDisableConfirm(true);
            }
          }}
          disabled={isLoading}
        />
      </div>

      {/* Second Row: Login Requirement Toggle (only show when 2FA is enabled) */}
      <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${requireForLogin
        ? 'bg-blue-50 border-blue-200 shadow-sm'
        : 'bg-amber-50 border-amber-200'
        }`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Settings className={`h-4 w-4 ${requireForLogin ? 'text-blue-600' : 'text-amber-600'}`} />
            <span className={`font-medium ${requireForLogin ? 'text-blue-900' : 'text-amber-900'}`}>
              Login Requirement
            </span>
          </div>
          <p className={`text-sm ${requireForLogin ? 'text-blue-700' : 'text-amber-700'}`}>
            {requireForLogin
              ? "Choose whether to require 2FA when logging in—if enabled, you'll need to enter a verification code every time you sign in."
              : "2FA is enabled but not required for login—you can sign in with just your password."}
          </p>
        </div>
        <Switch
          checked={requireForLogin}
          onCheckedChange={updateLoginRequirement}
          disabled={isLoading}
        />
      </div>

      {/* Confirmation Dialog for Disabling 2FA */}
      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Disable Two-Factor Authentication?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to disable two-factor authentication? This will make your account less secure.
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">⚠️ Security Warning:</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• Your account will be more vulnerable to unauthorized access</li>
                  <li>• Student information will have reduced protection</li>
                  <li>• You can re-enable 2FA anytime in settings</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep 2FA Enabled</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDisableConfirm(false);
                disableMFA();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Disable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
