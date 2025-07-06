
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCurrentConfig, getCurrentMessages } from '@/config/dynamic';

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const config = getCurrentConfig();
  const messages = getCurrentMessages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !password) {
      toast({
        title: messages.errors.missing_credentials || 'Missing Fields',
        description: messages.errors.fill_all_fields || 'Please enter both Student ID and Password.',
        variant: 'destructive',
      });
      return;
    }

    const email = `${studentId}@shasuncollege.edu.in`;
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : messages.errors.login_failed || 'Login failed';
      toast({
        title: messages.errors.login_failed || 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            {messages.auth.login_description || 'Enter your Student ID and Password to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="studentId">{config.forms.labels.student_id || 'Student ID'}</Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) =>
                  setStudentId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))
                }
                placeholder={config.forms.placeholders.student_id || 'e.g., SHA1234'}
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">{config.forms.labels.password || 'Password'}</Label>
                {onShowPasswordReset && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="ml-auto text-sm underline underline-offset-4 hover:text-primary"
                      >
                        Forgot your password?
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Password Reset</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please reach out to your class representative or staff coordinator to reset your password.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline">Close</Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={config.forms.placeholders.password || 'Enter your password'}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (messages.loading.signing_in || 'Logging in...') : (messages.auth.login_button || 'Login')}
            </Button>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onToggleSignup}
                className="underline underline-offset-4 text-primary"
              >
                Create one
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
