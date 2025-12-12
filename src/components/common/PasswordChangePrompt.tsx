import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Shows a one-time password-change prompt for users flagged with user_metadata.must_change_password === true.
 */
export function PasswordChangePrompt() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show once per session to prevent multiple dialogs
    if (hasShown) return;

    // Check session storage to prevent showing again after user action
    const dismissed = sessionStorage.getItem('password_change_dismissed');
    if (dismissed === 'true') {
      setHasShown(true);
      return;
    }

    // Production: Debug logging removed for security

    // Only show the prompt if the user has the must_change_password flag
    if (user?.user_metadata?.must_change_password === true) {
      setOpen(true);
      setHasShown(true);
    } else {
      setOpen(false);
    }
  }, [user, hasShown]);

  // Check if password is expired (not just needs change)
  const isPasswordExpired = user?.user_metadata?.password_expired === true;

  const dismissForever = async () => {
    if (!user) return;
    try {
      // Use the regular user API instead of admin API
      const { error } = await supabase.auth.updateUser({
        data: { must_change_password: false, password_expired: false }
      });
      if (error) throw error;
      // Mark as dismissed in session storage
      sessionStorage.setItem('password_change_dismissed', 'true');
      setOpen(false);
      setHasShown(true);
      toast({
        title: 'Password Choice Saved',
        description: 'You chose to keep your current password. You can change it anytime in Settings.'
      });
    } catch (error) {
      console.error('Failed to update user metadata:', error);
      // Still dismiss the dialog even if metadata update fails
      sessionStorage.setItem('password_change_dismissed', 'true');
      setOpen(false);
      setHasShown(true);
      toast({ title: 'Error', description: 'Failed to update user metadata', variant: 'destructive' });
    }
  };

  const goChangePassword = async () => {
    // Clear the flag when user chooses to change password
    try {
      await supabase.auth.updateUser({
        data: { must_change_password: false, password_expired: false }
      });
    } catch (error) {
      console.error('Failed to clear password flag:', error);
    }
    // Mark as dismissed in session storage
    sessionStorage.setItem('password_change_dismissed', 'true');
    navigate('/settings#password');
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={isPasswordExpired ? undefined : setOpen}>
      <AlertDialogContent className={`sm:max-w-md ${isPasswordExpired ? 'border-2 border-amber-500' : ''}`}>
        {isPasswordExpired && (
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        )}
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${isPasswordExpired ? 'text-amber-700' : ''}`}>
            {isPasswordExpired && <AlertTriangle className="h-6 w-6 text-amber-600" />}
            {isPasswordExpired ? 'Password Expired - Action Required' : 'Update your password'}
          </AlertDialogTitle>
          <AlertDialogDescription className={isPasswordExpired ? 'text-amber-900/80' : ''}>
            {isPasswordExpired
              ? 'Your password has expired for security reasons. You must change it now to continue using your account.'
              : 'Your account was created by an administrator. Would you like to keep the provided password or set a new one now?'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isPasswordExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">⚠️ Security Notice</p>
            <p>For your account security, passwords must be changed regularly. Please update your password to continue.</p>
          </div>
        )}
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {isPasswordExpired && (
            <button
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 order-last sm:order-first"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
          {!isPasswordExpired && (
            <AlertDialogCancel asChild>
              <button
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={dismissForever}
              >
                Keep Same Password
              </button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <button
              className={`px-4 py-2 rounded-md text-white ${isPasswordExpired
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-purple-600 hover:bg-purple-700'
                }`}
              onClick={goChangePassword}
            >
              {isPasswordExpired ? 'Change Password Now' : 'Change Password'}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
