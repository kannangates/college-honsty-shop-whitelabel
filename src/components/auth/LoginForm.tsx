import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Eye, EyeOff } from 'lucide-react';


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
  const { toast } = useToast();
  const { signIn } = useAuth();
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
      await signIn(studentId, password);
      // Don't navigate immediately - let auth context handle it
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : messages['login_failed'] || 'Login failed';
      toast({
        title: messages['login_failed'] || 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
