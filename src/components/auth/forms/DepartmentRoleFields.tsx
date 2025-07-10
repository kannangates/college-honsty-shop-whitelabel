
import React from 'react';
import DepartmentCombobox from '@/components/ui/DepartmentCombobox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WHITELABEL_CONFIG } from '@/config';

interface DepartmentRoleFieldsProps {
  formData: {
    department: string;
    shift: string;
    role: string;
  };
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const DepartmentRoleFields = ({
  formData,
  loading,
  onInputChange
}: DepartmentRoleFieldsProps) => {
  const labels = WHITELABEL_CONFIG.FORM_LABELS;
  const placeholders = WHITELABEL_CONFIG.FORM_PLACEHOLDERS;
  const shiftOptions = WHITELABEL_CONFIG.FORM_SHIFT_OPTIONS;
  const roleOptions = WHITELABEL_CONFIG.FORM_ROLE_OPTIONS;

  const isDeptAll = formData.department.toLowerCase() === 'all department';
  const isShiftFull = formData.shift === 'full';
  const isRoleForced = isDeptAll || isShiftFull;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium text-gray-700 text-left block">
          {labels?.department || 'Department'} *
        </Label>
        <DepartmentCombobox
          value={formData.department}
          onChange={(value) => onInputChange('department', value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shift" className="text-sm font-medium text-gray-700 text-left block">
          {labels?.shift || 'Shift'} *
        </Label>
        <Select
          value={formData.shift}
          onValueChange={(value) => onInputChange('shift', value)}
          disabled={loading}
        >
          <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
            <SelectValue placeholder={placeholders?.shift || 'Select your shift'} />
          </SelectTrigger>
          <SelectContent>
            {shiftOptions.map((shift) => (
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
          onValueChange={(value) => onInputChange('role', value)}
          disabled={loading || isRoleForced}
        >
          <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
            <SelectValue placeholder={placeholders?.role || 'Select your role'} />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isRoleForced && (
          <p className="text-xs text-gray-500">
            Role automatically set based on department/shift selection
          </p>
        )}
      </div>
    </>
  );
};
