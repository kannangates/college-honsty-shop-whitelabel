import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { AuthService } from '@/services/authService';

interface StudentData {
  studentId: string;
  name: string;
  department: string;
  shift: string;
  role: string;
  points: number;
  password: string;
  rowIndex: number;
}

export const BulkUserCreation = () => {
  const [csvData, setCsvData] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleCsvDataChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvData(event.target.value);
  };

  const processCSVData = (csvText: string): StudentData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const student: Record<string, unknown> = {};
      
      headers.forEach((header, i) => {
        student[header] = values[i] || '';
      });
      
      return {
        student_id: student.student_id as string || student.id as string || '',
        name: student.name as string || student.full_name as string || '',
        department: student.department as string || '',
        shift: student.shift as string || '1',
        role: student.role as string || 'student',
        points: parseInt(student.initial_points as string || student.points as string || '100'),
        password: student.password as string || 'Temp@123',
        rowIndex: index + 2
      };
    });
  };

  const handleCreateUsers = async () => {
    setProcessing(true);
    try {
      const students = processCSVData(csvData);
      let hasErrors = false;

      for (const student of students) {
        const signupData = {
          email: `${student.student_id}@shasuncollege.edu.in`,
          password: student.password,
          student_id: student.student_id,
          name: student.name,
          department: student.department,
          role: student.role as Database['public']['Enums']['user_role'],
          shift: student.shift,
          points: student.points,
          user_metadata: { must_change_password: true }
        };

        const signupResult = await AuthService.signup(signupData);

        if (!signupResult.success) {
          hasErrors = true;
          toast({
            title: `Error creating user at row ${student.rowIndex}`,
            description: signupResult.error || 'Failed to create user',
            variant: 'destructive',
          });
        } else {
          toast({
            title: `User created at row ${student.rowIndex}`,
            description: `Successfully created user: ${student.name}`,
          });
        }
      }

      if (!hasErrors) {
        toast({
          title: 'Success',
          description: 'All users created successfully!',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  function downloadTemplate() {
    const header = 'student_id,name,department,shift,role,initial_points,password';
    const blob = new Blob([header + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_users_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk User Creation</CardTitle>
        <CardDescription>Create multiple users from CSV data.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="csvData">CSV Data</Label>
          <Textarea
            id="csvData"
            value={csvData}
            onChange={handleCsvDataChange}
            placeholder="student_id,name,department,shift,role,initial_points,password"
            className="resize-none"
          />
        </div>
        <Button onClick={handleCreateUsers} disabled={processing}>
          {processing ? 'Creating Users...' : 'Create Users'}
        </Button>
        <Button variant="outline" onClick={() => downloadTemplate()}>
          Download CSV template
        </Button>
      </CardContent>
    </Card>
  );
};
