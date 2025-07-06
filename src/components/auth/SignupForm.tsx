
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCurrentConfig, getCurrentMessages } from '@/config/dynamic';
import { PersonalInfoFields } from './forms/PersonalInfoFields';
import { PasswordFields } from './forms/PasswordFields';
import { DepartmentRoleFields } from './forms/DepartmentRoleFields';

export const SignupForm = ({ onToggleLogin }: { onToggleLogin?: () => void }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    mobileNumber: '',
    role: 'student',
    shift: '1',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentIdError, setStudentIdError] = useState('');
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const config = getCurrentConfig();
  const messages = getCurrentMessages();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'studentId') {
      const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, '');
      if (value !== alphanumericOnly) {
        setStudentIdError(messages.errors?.student_id_alphanumeric || 'Only letters and numbers allowed');
      } else {
        setStudentIdError('');
      }
      setFormData(prev => ({ ...prev, studentId: alphanumericOnly }));
    }
  };

  // Auto-adjust role based on department and shift
  useEffect(() => {
    const isDeptAll = formData.department.toLowerCase() === 'all department';
    const isShiftFull = formData.shift === 'full';
    const shouldForceTeacher = isDeptAll || isShiftFull;

    if (shouldForceTeacher && formData.role !== 'teacher') {
      setFormData(prev => ({ ...prev, role: 'teacher' }));
    } else if (!shouldForceTeacher && formData.role === 'teacher') {
      setFormData(prev => ({ ...prev, role: 'student' }));
    }
  }, [formData.department, formData.shift, formData.role]);

  const validateForm = () => {
    if (!formData.studentId || !formData.name || !formData.email || !formData.password || 
        !formData.department || !formData.mobileNumber) {
      toast({
        title: messages.errors?.all_fields_required || 'All fields required',
        description: messages.errors?.fill_all_fields || 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.studentId,
        formData.name,
        formData.department,
        formData.mobileNumber,
        formData.role,
        formData.shift,
        config.app?.welcome_points || 100
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-lg border border-purple-200/30 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-100/20">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          Join Us! ✨
        </CardTitle>
        <CardDescription className="text-gray-600">
          Create your account and start your journey with us 🚀
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalInfoFields
            formData={formData}
            studentIdError={studentIdError}
            loading={loading}
            onInputChange={handleInputChange}
          />
          
          <PasswordFields
            formData={formData}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            loading={loading}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <DepartmentRoleFields
            formData={formData}
            loading={loading}
            onInputChange={handleInputChange}
          />

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account 🎉
                </span>
              )}
            </Button>
          </div>

          <div className="md:col-span-2 text-center mt-6">
            <p className="text-gray-600 mb-4">
              Already have an account? 😊
            </p>
            <Button
              variant="outline"
              type="button"
              onClick={onToggleLogin}
              className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl px-6"
            >
              Sign In Instead ✨
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
