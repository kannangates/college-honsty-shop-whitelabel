import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentIdComboboxProps {
  /** Currently selected student ID string (empty if none) */
  value: string;
  /** Callback when a student ID is chosen */
  onChange: (value: string) => void;
  /** Disable user interaction */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Extra classes for the trigger button */
  className?: string;
}

interface Student {
  id: string;
  student_id: string;
  name: string;
}

export const StudentIdCombobox: React.FC<StudentIdComboboxProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Search student ID...',
  className = '',
}) => {
  const [open, setOpen] = React.useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Fetch students from database
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, student_id, name')
        .eq('role', 'student')
        .eq('status', 'active')
        .order('student_id', { ascending: true });

      if (error) throw error;

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student IDs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch students when popover opens
  useEffect(() => {
    if (open && students.length === 0) {
      fetchStudents();
    }
  }, [open, students.length, fetchStudents]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;

    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.student_id.toLowerCase().includes(query) ||
        student.name.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
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
          {value ? (
            <span>
              {students.find((s) => s.student_id === value)?.student_id}
              {' - '}
              {students.find((s) => s.student_id === value)?.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[400px]"
        align="start"
        side="bottom"
        sideOffset={4}
        style={{ zIndex: 9999 }}
      >
        <Command>
          <CommandInput
            placeholder="Search by ID or name..."
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[300px]">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <CommandEmpty>
                {searchQuery ? 'No student found.' : 'No students available.'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredStudents.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.student_id}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === student.student_id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{student.student_id}</span>
                      <span className="text-xs text-gray-500">{student.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StudentIdCombobox;
