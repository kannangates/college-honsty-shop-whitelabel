import React, { useState } from 'react';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorPrompt({ onSuccess, onCancel }: TwoFactorPromptProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyMFA } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const verified = await verifyMFA(code);

      if (verified) {
        toast({
          title: 'Verification Successful',
          description: 'Welcome back! You have been successfully authenticated.',
          variant: 'default',
        });
        onSuccess();
        // Redirect to dashboard after successful 2FA verification
        window.location.href = '/dashboard';
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Invalid verification code. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast({
        title: 'Verification Error',
        description: error instanceof Error ? error.message : 'Failed to verify code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl overflow-hidden animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-b border-blue-100/20">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent text-center flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-gray-600 text-center">
          Enter the 6-digit code from your authenticator app to complete login
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-700">
              Verification Code 🔐
            </Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl font-mono tracking-widest h-16 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
              autoComplete="one-time-code"
              autoFocus
              required
            />
            <p className="text-xs text-gray-500 text-center">
              Open your authenticator app and enter the 6-digit code
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={code.length !== 6 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verify & Login
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            🛡️ This extra security step helps protect your account and sensitive student information
          </p>
        </div>
      </CardContent>
    </Card>
  );
}