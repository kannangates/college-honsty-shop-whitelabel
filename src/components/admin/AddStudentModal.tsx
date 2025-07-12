import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DepartmentCombobox } from '@/components/ui/DepartmentCombobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';





interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentAdded: () => void;
}

export const AddStudentModal = ({ open, onOpenChange, onStudentAdded }: AddStudentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    student_id: string;
    name: string;
    email: string;
    department: string;
    shift: string;
    password: string;
    role: string;
    points: string;
  }>({
    student_id: '',
    name: '',
    email: '',
    department: 'Computer Science',
    shift: 'Morning (1st Shift)',
    password: '',
    role: 'student',
    points: '0'
  });

  // Auto-generate email when student ID changes
  const handleStudentIdChange = (value: string) => {
    const cleanValue = value.trim();
    setFormData(prev => ({
      ...prev,
      student_id: cleanValue,
      email: cleanValue ? `${cleanValue}@shasuncollege.edu.in` : ''
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        studentId: formData.student_id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        shift: formData.shift,
        role: formData.role,
        points: parseInt(formData.points),
        userMetadata: { must_change_password: true }
      };
      
      console.log('📤 Sending payload to auth-signup:', payload);
      
      const { data, error } = await supabase.functions.invoke('auth-signup', {
        body: payload
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student account created successfully',
      });

      setFormData({
        student_id: '',
        name: '',
        email: '',
        department: 'Computer Science',
        shift: 'Morning (1st Shift)',
        password: '',
        role: 'student',
        points: '0'
      });
      
      onStudentAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating student:', error);
      
      // Try to extract detailed error message
      let errorMessage = 'Failed to create student account';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Student
          </DialogTitle>
          <DialogDescription>
            Create a new student account. The user will be required to change their password on first login for security.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              value={formData.student_id}
              onChange={(e) => handleStudentIdChange(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email (Auto-generated)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-100"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label>Department</Label>
            <DepartmentCombobox value={formData.department} onChange={(val) => setFormData({ ...formData, department: val })} />
          </div>
          

          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="points">Initial Points</Label>
            <Input
              id="points"
              type="number"
              min="0"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="shift">Shift</Label>
            <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning (1st Shift)">Morning (1st Shift)</SelectItem>
                <SelectItem value="Evening (2nd Shift)">Evening (2nd Shift)</SelectItem>
                <SelectItem value="Full Shift">Full Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
