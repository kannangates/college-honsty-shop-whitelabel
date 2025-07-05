
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { CONFIG } from '@/config';

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
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="studentId">{CONFIG.FORMS.LABELS.STUDENT_ID} *</Label>
        <Input
          id="studentId"
          type="text"
          placeholder={CONFIG.FORMS.PLACEHOLDERS.STUDENT_ID}
          value={formData.studentId}
          onChange={(e) => onInputChange('studentId', e.target.value)}
          required
          disabled={loading}
        />
        {studentIdError && (
          <p className="text-sm text-red-500">{studentIdError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">{CONFIG.FORMS.LABELS.FULL_NAME} *</Label>
        <Input
          id="name"
          type="text"
          placeholder={CONFIG.FORMS.PLACEHOLDERS.FULL_NAME}
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobileNumber">{CONFIG.FORMS.LABELS.MOBILE_NUMBER} *</Label>
        <Input
          id="mobileNumber"
          type="tel"
          placeholder={CONFIG.FORMS.PLACEHOLDERS.MOBILE_NUMBER}
          value={formData.mobileNumber}
          onChange={(e) => onInputChange('mobileNumber', e.target.value)}
          required
          disabled={loading}
        />
      </div>
    </>
  );
};
