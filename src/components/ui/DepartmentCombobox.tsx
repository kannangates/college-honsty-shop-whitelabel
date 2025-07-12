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
  'B.COM (GENERAL) - SEC A',
  'B.COM (GENERAL) - SEC B',
  'B.COM (ACCOUNTING & FINANCE) - SEC A',
  'B.COM (ACCOUNTING & FINANCE) - SEC B',
  'B B A - SEC A',
  'B B A - SEC B',
  'B.Sc (COMPUTER SCIENCE) - SEC A',
  'B.Sc (COMPUTER SCIENCE) - SEC B',
  'B C A',
  'B. COM (CORPORATE SECREARYSHIP)',
  'B. COM (HONORS)',
  'B.Sc (PSYCHOLOGY)',
  'M.Com (ACCOUNTING & FINANCE)',
  'M.Sc Pyschology',
  'B.Sc ID& D',
  'B.Com (BANK MANAGEMENT)',
  'M.Com (General)',
  'M.Phil Commerce',
  'Ph.D Commerce',
  'All Department',
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
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto" align="start" side="bottom" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search department..." className="h-9" />
          <CommandEmpty>No department found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
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
