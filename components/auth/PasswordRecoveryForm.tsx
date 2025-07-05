
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, Send } from 'lucide-react';

interface PasswordRecoveryFormProps {
  onBack: () => void;
}

export const PasswordRecoveryForm = ({ onBack }: PasswordRecoveryFormProps) => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast({
        title: 'Student ID Required',
        description: 'Please enter your student ID.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('forgot-password', {
        body: { studentId: studentId.trim() }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setSent(true);
      toast({
        title: 'Reset Link Sent',
        description: `Password reset instructions have been sent to ${data.email}`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Sent
          </CardTitle>
          <CardDescription>
            Check your email for password reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              We've sent a password reset link to your registered email address. 
              Please check your inbox and spam folder.
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-[#202072]/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#202072] to-[#e66166] bg-clip-text text-transparent">
          Reset Password
        </CardTitle>
        <CardDescription>
          Enter your student ID to receive password reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="Enter your student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] hover:from-[#1a1c60] hover:to-[#d55256] text-white"
            disabled={loading}
          >
            {loading ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reset Link
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
