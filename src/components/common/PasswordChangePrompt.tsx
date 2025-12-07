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

    // Debug logging
    console.log('🔐 PasswordChangePrompt - User metadata:', user?.user_metadata);
    console.log('🔐 must_change_password:', user?.user_metadata?.must_change_password);
    console.log('🔐 password_expired:', user?.user_metadata?.password_expired);

    // Only show the prompt if the user has the must_change_password flag
    if (user?.user_metadata?.must_change_password === true) {
      console.log('🔐 Opening password change prompt');
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
      setOpen(false);
      setHasShown(true);
      toast({
        title: 'Password Choice Saved',
        description: 'You chose to keep your current password. You can change it anytime in Settings.'
      });
    } catch (error) {
      console.error('Failed to update user metadata:', error);
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
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPasswordExpired ? '🔐 Password Expired' : 'Update your password'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPasswordExpired
              ? 'Your password has expired for security reasons. You must change it now to continue using your account.'
              : 'Your account was created by an administrator. Would you like to keep the provided password or set a new one now?'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
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
              className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
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
