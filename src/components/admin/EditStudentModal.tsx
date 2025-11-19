import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DepartmentCombobox from '@/components/ui/DepartmentCombobox';

interface User {
  id: string;
  name: string;
  student_id: string;
  email: string | null;
  department: string | null;
  mobile_number: string | null;
  role: string;
  points: number | null;
  status: string;
  shift?: string;
}

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: User | null;
  onStudentUpdated: () => void;
}

export const EditStudentModal = ({ open, onOpenChange, student, onStudentUpdated }: EditStudentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    mobile_number: '',
    password: '',
    role: '',
    points: '',
    status: '',
    shift: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        department: student.department || '',
        mobile_number: student.mobile_number || '',
        role: student.role || 'student',
        points: (student.points || 0).toString(),
        password: '',
        status: student.status || 'active',
        shift: student.shift || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setLoading(true);

    try {
      const updates: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        mobile_number: formData.mobile_number,
        role: formData.role,
        points: parseInt(formData.points) || 0,
        status: formData.status,
        shift: formData.shift,
        updated_at: new Date().toISOString()
      };
      if (formData.password.trim()) {
        await supabase.auth.admin.updateUserById(student.id, {
          password: formData.password,
          user_metadata: { must_change_password: true }
        });
      }
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student profile updated successfully',
      });

      onStudentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Edit Student Profile
          </DialogTitle>
          <DialogDescription>Update student information and settings</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div>
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              value={student.student_id}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <DepartmentCombobox
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value })}
              placeholder="Select department"
            />
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={formData.mobile_number}
              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]" sideOffset={5} align="start">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shift">Shift</Label>
            <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
              <SelectTrigger id="shift">
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]" sideOffset={5} align="start">
                <SelectItem value="Morning (1st Shift)">Morning (1st Shift)</SelectItem>
                <SelectItem value="Evening (2nd Shift)">Evening (2nd Shift)</SelectItem>
                <SelectItem value="Full Shift">Full Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="0"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]" sideOffset={5} align="start">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Reset Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};