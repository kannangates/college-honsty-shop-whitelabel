
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONFIG } from '@/config';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentRoleFieldsProps {
  formData: {
    department: string;
    shift: string;
    role: string;
  };
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
}

const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Biotechnology",
  "Information Technology",
  "All Department"
];

export const DepartmentRoleFields = ({
  formData,
  loading,
  onInputChange
}: DepartmentRoleFieldsProps) => {
  const isRoleDisabled = formData.department.toLowerCase() === 'all department' || formData.shift === 'full';
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="department">{CONFIG.FORMS.LABELS.DEPARTMENT} *</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full h-10 border border-input bg-background rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !formData.department && "text-muted-foreground"
              )}
              disabled={loading}
            >
              {formData.department || "Select Department"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search department..." />
              <CommandList>
                <CommandEmpty>No department found.</CommandEmpty>
                {DEPARTMENTS.map((dept) => (
                  <CommandItem
                    key={dept}
                    value={dept}
                    onSelect={() => {
                      onInputChange('department', dept);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.department === dept ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {dept}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shift">{CONFIG.FORMS.LABELS.SHIFT} *</Label>
        <Select 
          value={formData.shift} 
          onValueChange={(value) => onInputChange('shift', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select shift" />
          </SelectTrigger>
          <SelectContent>
            {CONFIG.FORMS.SHIFT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="role">{CONFIG.FORMS.LABELS.ROLE} *</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => onInputChange('role', value)}
          disabled={loading || isRoleDisabled}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {CONFIG.FORMS.ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
