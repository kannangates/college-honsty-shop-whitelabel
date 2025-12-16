import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WHITELABEL_CONFIG, CONFIG } from '@/config';
import { TwoFactorPrompt } from './TwoFactorPrompt';
import { supabase } from '@/integrations/supabase/client';


export function LoginForm({
  className,
  onToggleSignup,
  onShowPasswordReset,
}: {
  className?: string;
  onToggleSignup?: () => void;
  onShowPasswordReset?: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{ studentId: string, password: string } | null>(null);
  const { toast } = useToast();
  const { signIn, checkMFAStatus } = useAuth();
  const navigate = useNavigate();

  const labels = WHITELABEL_CONFIG.forms.labels;
  const placeholders = WHITELABEL_CONFIG.forms.placeholders;
  const messages = WHITELABEL_CONFIG.messages.auth;
  const loadingMessages = WHITELABEL_CONFIG.messages.loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !password) {
      toast({
        title: messages['missing_credentials'] || 'Missing Fields',
        description: messages['fill_all_fields'] || 'Please enter both Student ID and Password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // First, attempt to sign in with credentials (skip redirect for now)
      await signIn(studentId, password, true);

      // After successful login, check if user has 2FA enabled and required for login
      const mfaStatus = await checkMFAStatus();

      // Check user's preference for requiring 2FA at login from user metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const requireMFAForLogin = authUser?.user_metadata?.mfa_require_for_login !== false; // Default to true

      if (mfaStatus.isEnabled && !mfaStatus.isVerified && requireMFAForLogin) {
        // User has 2FA enabled, not verified, and requires it for login - show 2FA prompt
        setTempCredentials({ studentId, password });
        setShowTwoFactor(true);
        setLoading(false);
      } else {
        // No 2FA, already verified, or not required for login - proceed with redirect
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      let title = messages['login_failed'] || 'Login Failed';
      let description = 'Please try again';

      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();

        if (errorMessage.includes('failed to fetch') || errorMessage.includes('network') || errorMessage.includes('err_name_not_resolved')) {
          title = '🌐 Network Problem';
          description = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid_credentials')) {
          title = '🔐 Invalid Credentials';
          description = 'Student ID or password is incorrect. Please check your credentials and try again.';
        } else if (errorMessage.includes('email not confirmed')) {
          title = '📧 Email Not Verified';
          description = 'Please verify your email address before signing in.';
        } else if (errorMessage.includes('too many requests')) {
          title = '⏰ Too Many Attempts';
          description = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (errorMessage.includes('user not found')) {
          title = '👤 User Not Found';
          description = 'No account found with this Student ID. Please check your ID or contact support.';
        } else {
          description = err.message;
        }
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    setShowTwoFactor(false);
    setTempCredentials(null);
    // Auth context will handle navigation after successful 2FA
  };

  const handleTwoFactorCancel = () => {
    setShowTwoFactor(false);
    setTempCredentials(null);
    // Could optionally sign out the user here if needed
  };

  // Show 2FA prompt if needed
  if (showTwoFactor) {
    return (
      <div className={`flex flex-col gap-6 ${className}`}>
        <TwoFactorPrompt
          onSuccess={handleTwoFactorSuccess}
          onCancel={handleTwoFactorCancel}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl overflow-hidden animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-100/20">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-center">
            Welcome Back! ✨
          </CardTitle>
          <CardDescription className="text-gray-600 text-center">
            {messages.login_description || 'Sign in to continue your journey'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">
                {labels.student_id || 'Student ID'} 🎓
              </Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) =>
                  setStudentId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))
                }
                placeholder={placeholders.student_id || 'Enter your ID'}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {labels.password || 'Password'} 🔐
                </Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs text-purple-600 hover:text-purple-800 underline underline-offset-4 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-center">🔑 Password Reset</AlertDialogTitle>
                      <AlertDialogDescription className="text-center text-gray-600">
                        Need help with your password? No worries! 😊
                        <br /><br />
                        Please reach out to your class representative or staff coordinator to reset your password.
                        <br /><br />
                        They'll help you get back into your account quickly! 🚀
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                      <AlertDialogAction className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6">
                        Got it! ✨
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={placeholders.password || 'Enter your password'}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>


            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingMessages.signing_in}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {messages.login_button || 'Sign In'} 🚀
                </span>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
