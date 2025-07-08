
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentConfig } from '@/config';

interface PersonalInfoFieldsProps {
  formData: {
    studentId: string;
    name: string;
    email: string;
  };
  studentIdError: string;
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const PersonalInfoFields = ({
  formData,
  studentIdError,
  loading,
  onInputChange
}: PersonalInfoFieldsProps) => {
  const config = getCurrentConfig();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="studentId" className="text-sm font-medium text-gray-700 text-left block">
          {config.forms?.labels?.student_id || 'Student ID'} *
        </Label>
        <Input
          id="studentId"
          type="text"
          placeholder={config.forms?.placeholders?.student_id || 'Enter your Student ID'}
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
          {config.forms?.labels?.full_name || 'Full Name'} *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder={config.forms?.placeholders?.full_name || 'Enter your full name'}
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
