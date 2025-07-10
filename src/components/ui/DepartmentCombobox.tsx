import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';


const DEPARTMENT_OPTIONS: readonly string[] = [
  'All Department',
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];

interface DepartmentComboboxProps {
  /** Currently selected department string (empty if none) */
  value: string;
  /** Callback when a department is chosen */
  onChange: (value: string) => void;
  /** Disable user interaction */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Extra classes for the trigger button */
  className?: string;
}

export const DepartmentCombobox: React.FC<DepartmentComboboxProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select department ...',
  className = '',
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between border-purple-200 rounded-xl',
            className,
          )}
          disabled={disabled}
        >
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search department..." className="h-9" />
          <CommandEmpty>No department found.</CommandEmpty>
          <CommandGroup>
            {DEPARTMENT_OPTIONS.map((dept) => (
              <CommandItem
                key={dept}
                value={dept}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === dept ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {dept}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DepartmentCombobox;
