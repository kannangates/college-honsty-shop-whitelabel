
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { getCurrentConfig } from '@/config';

interface PasswordFieldsProps {
  formData: {
    password: string;
    confirmPassword: string;
  };
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export const PasswordFields = ({
  formData,
  showPassword,
  showConfirmPassword,
  loading,
  onInputChange,
  onTogglePassword,
  onToggleConfirmPassword
}: PasswordFieldsProps) => {
  const config = getCurrentConfig();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700 text-left block">
          {config.forms?.labels?.password || 'Password'} *
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={config.forms?.placeholders?.password || 'Enter your password'}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
            disabled={loading}
            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl pr-10"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 text-left block">
          {config.forms?.labels?.confirm_password || 'Confirm Password'} *
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={config.forms?.placeholders?.confirm_password || 'Confirm your password'}
            value={formData.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            required
            disabled={loading}
            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl pr-10"
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};
