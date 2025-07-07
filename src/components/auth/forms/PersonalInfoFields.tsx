
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentConfig } from '@/config/dynamic';

interface PersonalInfoFieldsProps {
  formData: {
    studentId: string;
    name: string;
    email: string;
    mobileNumber: string;
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
        <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">
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
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
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

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          {config.forms?.labels?.email || 'Email'} *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={config.forms?.placeholders?.email || 'Enter your email'}
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required
          disabled={loading}
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
          {config.forms?.labels?.mobile_number || 'Mobile Number'} *
        </Label>
        <Input
          id="mobileNumber"
          type="tel"
          placeholder={config.forms?.placeholders?.mobile_number || 'Enter your mobile number'}
          value={formData.mobileNumber}
          onChange={(e) => onInputChange('mobileNumber', e.target.value)}
          required
          disabled={loading}
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
        />
      </div>
    </>
  );
};
