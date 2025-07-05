
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CONFIG } from '@/config';
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'studentId') {
      const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, '');
      if (value !== alphanumericOnly) {
        setStudentIdError(CONFIG.MESSAGES.ERRORS.STUDENT_ID_ALPHANUMERIC);
      } else {
        setStudentIdError('');
      }
      setFormData(prev => ({ ...prev, studentId: alphanumericOnly }));
    }
  };

  // Auto-adjust role based on department and shift
  React.useEffect(() => {
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
        title: CONFIG.MESSAGES.ERRORS.ALL_FIELDS_REQUIRED,
        description: CONFIG.MESSAGES.ERRORS.FILL_ALL_FIELDS,
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
        CONFIG.SYSTEM.DEFAULT_POINTS
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
    <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-2 border-[#202072]/20 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#202072] to-[#e66166] bg-clip-text text-transparent">
          Create Account
        </CardTitle>
        <CardDescription className="text-gray-600">
          Fill in your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] hover:from-[#1a1c60] hover:to-[#d55256] text-white"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          <div className="md:col-span-2 text-center mt-6">
            <p className="text-gray-600 mb-4">
              Already have an account?
            </p>
            <Button
              variant="outline"
              type="button"
              onClick={onToggleLogin}
              className="border-[#202072]/30 hover:bg-[#202072]/5"
            >
              Sign In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
