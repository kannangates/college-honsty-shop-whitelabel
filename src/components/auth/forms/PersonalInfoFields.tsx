
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WHITELABEL_CONFIG } from '@/config';
import type { SignupFormData } from '@/types/forms';

interface PersonalInfoFieldsProps {
  formData: SignupFormData;
  studentIdError: string;
  loading: boolean;
  onInputChange: (field: keyof SignupFormData, value: string) => void;
}

export const PersonalInfoFields = ({
  formData,
  studentIdError,
  loading,
  onInputChange
}: PersonalInfoFieldsProps) => {
  const labels = WHITELABEL_CONFIG.forms.labels;
  const placeholders = WHITELABEL_CONFIG.forms.placeholders;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="studentId" className="text-sm font-medium text-gray-700 text-left block">
          {labels.student_id || 'Student ID'} *
        </Label>
        <Input
          id="studentId"
          type="text"
          placeholder={placeholders.student_id || 'Enter your Student ID'}
          value={formData.studentId}
          onChange={(e) => onInputChange('studentId', e.target.value)}
          required
          disabled={loading}
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
        />
        {studentIdError && (
          <p className="text-sm text-red-500">{studentIdError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700 text-left block">
          {labels.full_name || 'Full Name'} *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder={placeholders.full_name || 'Enter your full name'}
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          required
          disabled={loading}
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
        />
      </div>

      {/* Email field hidden - auto-generated from Student ID */}
      <input
        type="hidden"
        value={formData.email}
        onChange={(e) => onInputChange('email', e.target.value)}
      />

    </>
  );
};
