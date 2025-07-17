import React, { useState, useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WHITELABEL_CONFIG } from '@/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

// ✅ Locally defined form type (no need to import from types/forms.ts)
type SignupFormData = {
  student_id: string;
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  department: string;
  role: string;
  shift: string;
  mobile_number?: string;
};

export const SignupForm = ({ onToggleLogin }: { onToggleLogin?: () => void }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    student_id: '',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    department: '',
    role: 'student',
    shift: '1',
    mobile_number: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const [loading, setLoading] = useState(false);
  const [studentIdError, setStudentIdError] = useState('');

  const { signUp } = useAuth();
  const { toast } = useToast();
  const config = WHITELABEL_CONFIG;
  const labels = config.forms.labels;
  const placeholders = config.forms.placeholders;
  const errorMessages = config.messages.errors;
  const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    if (field === 'student_id') {
      const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, '');
      if (value !== alphanumericOnly) {
        setStudentIdError(errorMessages?.student_id_alphanumeric || 'Only letters and numbers allowed');
      } else {
        setStudentIdError('');
      }

      const email = alphanumericOnly ? `${alphanumericOnly}@shasuncollege.edu.in` : '';
      setFormData(prev => ({
        ...prev,
        student_id: alphanumericOnly,
        email,
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

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
    if (!formData.student_id || !formData.full_name || !formData.email || !formData.password || !formData.department) {
      toast({
        title: errorMessages?.all_fields_required || 'All fields required',
        description: errorMessages?.fill_all_fields || 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password !== formData.confirm_password) {
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
        formData.student_id,
        formData.full_name,
        formData.department,
        formData.role,
        formData.shift,
        WHITELABEL_CONFIG.app.welcome_points || 100,
        captchaToken || undefined
      );

      setFormData({
        student_id: '',
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        department: '',
        role: 'student',
        shift: '1',
        mobile_number: '',
      });
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
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl overflow-hidden animate-fade-in">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-100/20">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          Join Us! ✨
        </CardTitle>
        <CardDescription className="text-gray-600">
          Create your account and start your journey with us 🚀
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student ID */}
          <div className="space-y-2">
            <Label htmlFor="student_id" className="text-sm font-medium text-gray-700 text-left block">
              {labels.student_id || 'Student ID'} *
            </Label>
            <Input
              id="student_id"
              type="text"
              placeholder={placeholders.student_id || 'Enter your Student ID'}
              value={formData.student_id}
              onChange={(e) => handleInputChange('student_id', e.target.value)}
              required
              disabled={loading}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
            />
            {studentIdError && (
              <p className="text-sm text-red-500">{studentIdError}</p>
            )}
          </div>
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 text-left block">
              {labels.full_name || 'Full Name'} *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={placeholders.full_name || 'Enter your full name'}
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              required
              disabled={loading}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
            />
          </div>
          {/* Email field hidden - auto-generated from Student ID */}
          <input
            type="hidden"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-gray-700 text-left block">
              {labels?.department || 'Department'} *
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleInputChange('department', value)}
              disabled={loading}
            >
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder={placeholders?.department || 'Select your department'} />
              </SelectTrigger>
              <SelectContent>
                {WHITELABEL_CONFIG.forms.department_options.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift" className="text-sm font-medium text-gray-700 text-left block">
              {labels?.shift || 'Shift'} *
            </Label>
            <Select
              value={formData.shift}
              onValueChange={(value) => handleInputChange('shift', value)}
              disabled={loading}
            >
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder={placeholders?.shift || 'Select your shift'} />
              </SelectTrigger>
              <SelectContent>
                {WHITELABEL_CONFIG.forms.shift_options.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700 text-left block">
              {labels?.role || 'Role'} *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={loading || (formData.department.toLowerCase() === 'all department' || formData.shift === 'full')}
            >
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder={placeholders?.role || 'Select your role'} />
              </SelectTrigger>
              <SelectContent>
                {WHITELABEL_CONFIG.forms.role_options.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(formData.department.toLowerCase() === 'all department' || formData.shift === 'full') && (
              <p className="text-xs text-gray-500">
                Role automatically set based on department/shift selection
              </p>
            )}
          </div>

          <div className="mt-4 flex w-full justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey={HCAPTCHA_SITE_KEY}
              onVerify={token => setCaptchaToken(token)}
            />
          </div>

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

          <div className="text-center mt-6">
            <p className="text-gray-600 mb-4">Already have an account? 😊</p>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                navigate('/login');
              }}
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
