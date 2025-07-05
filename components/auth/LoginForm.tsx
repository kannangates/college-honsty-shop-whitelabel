
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { CONFIG } from '@/config';
import { CaptchaManager } from '@/utils/captchaManager';

interface LoginFormProps {
  onToggleSignup?: () => void;
  onShowPasswordReset?: () => void;
}

export const LoginForm = ({ onToggleSignup, onShowPasswordReset }: LoginFormProps) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaManager] = useState(() => CaptchaManager.getInstance());
  const { signIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize captcha
    captchaManager.initialize();
    
    // Render captcha if enabled
    if (captchaManager.isEnabled()) {
      setTimeout(() => {
        captchaManager.renderCaptcha('hcaptcha-container', (token: string) => {
          setCaptchaToken(token);
        });
      }, 100);
    }
  }, [captchaManager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!studentId || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both student ID and password.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Verify captcha if enabled
    if (captchaManager.isEnabled() && !captchaToken) {
      toast({
        title: 'Captcha Required',
        description: 'Please complete the captcha verification.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (captchaManager.isEnabled()) {
      const captchaValid = await captchaManager.verifyCaptcha(captchaToken);
      if (!captchaValid) {
        toast({
          title: 'Captcha Failed',
          description: 'Captcha verification failed. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    try {
      await signIn(studentId, password);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-[#202072]/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#202072] to-[#e66166] bg-clip-text text-transparent">
          Sign In
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter your student credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-left block">{CONFIG.FORMS.LABELS.STUDENT_ID}</Label>
            <Input
              id="studentId"
              type="text"
              placeholder={CONFIG.FORMS.PLACEHOLDERS.STUDENT_ID}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-left block">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* hCaptcha container */}
          {captchaManager.isEnabled() && (
            <div className="flex justify-center">
              <div id="hcaptcha-container"></div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] hover:from-[#1a1c60] hover:to-[#d55256] text-white"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Password Reset Link */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onShowPasswordReset}
              className="text-[#202072] hover:text-[#e66166] text-sm"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Forgot your password?
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600 mb-4">
              {"Don't have an account?"}
            </p>
            <Button
              variant="outline"
              type="button"
              onClick={onToggleSignup}
              className="border-[#202072]/30 hover:bg-[#202072]/5"
            >
              Create Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
