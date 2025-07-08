
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentConfig } from '@/config';

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
  const config = getCurrentConfig();

  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Information Technology',
    'All Department'
  ];

  const shifts = config.forms?.shift_options || [
    { value: '1', label: 'Morning (1st Shift)' },
    { value: '2', label: 'Evening (2nd Shift)' },
    { value: 'full', label: 'Full Day' }
  ];

  const roles = config.forms?.role_options || [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' }
  ];

  const isDeptAll = formData.department.toLowerCase() === 'all department';
  const isShiftFull = formData.shift === 'full';
  const isRoleForced = isDeptAll || isShiftFull;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium text-gray-700 text-left block">
          {config.forms?.labels?.department || 'Department'} *
        </Label>
        <Select
          value={formData.department}
          onValueChange={(value) => onInputChange('department', value)}
          disabled={loading}
        >
          <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shift" className="text-sm font-medium text-gray-700 text-left block">
          {config.forms?.labels?.shift || 'Shift'} *
        </Label>
        <Select
          value={formData.shift}
          onValueChange={(value) => onInputChange('shift', value)}
          disabled={loading}
        >
          <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
            <SelectValue placeholder="Select your shift" />
          </SelectTrigger>
          <SelectContent>
            {shifts.map((shift) => (
              <SelectItem key={shift.value} value={shift.value}>
                {shift.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium text-gray-700 text-left block">
          {config.forms?.labels?.role || 'Role'} *
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value) => onInputChange('role', value)}
          disabled={loading || isRoleForced}
        >
          <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
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
