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
export const PasswordChangePrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.must_change_password) {
      setOpen(true);
    }
  }, [user]);

  const dismissForever = async () => {
    if (!user) return;
    try {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { must_change_password: false },
      });
      setOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user metadata', variant: 'destructive' });
    }
  };

  const goChangePassword = () => {
    navigate('/settings#password');
    setOpen(false);
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Update your password</AlertDialogTitle>
          <AlertDialogDescription>
            Your account was created by an administrator. Would you like to keep the provided password or set a new one now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={dismissForever}
            >
              Keep Same Password
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
              onClick={goChangePassword}
            >
              Change Password
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
