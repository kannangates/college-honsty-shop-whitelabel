import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, UserPlus, Trophy, RefreshCw, Download, Eye, Edit, Upload, KeyRound } from 'lucide-react';
import { AddStudentModal } from '@/components/admin/AddStudentModal';
import { BulkUploadModal } from '@/components/admin/BulkUploadModal';
import { supabase } from '@/integrations/supabase/client';
import { useDataExport } from '@/hooks/useDataExport';
import { useToast } from '@/hooks/use-toast';
import DepartmentCombobox from '@/components/ui/DepartmentCombobox';
import { Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  mobile_number?: string;
  role: 'admin' | 'student' | 'teacher' | 'developer'; // Properly typed role
  points: number;
  created_at: string;
  updated_at: string;
  department?: string;
  shift: string;
  status: string;
  last_signed_in_at?: string;
}

interface UserStats {
  totalStudents: number;
  activeThisMonth: number;
  highestPoints: number;
  departments: number;
}

const AdminStudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalStudents: 0,
    activeThisMonth: 0,
    highestPoints: 0,
    departments: 0
  });
  const [editForm, setEditForm] = useState<{
    name?: string;
    email?: string;
    department?: string;
    mobile_number?: string;
    status?: string;
    shift?: string;
    role?: 'admin' | 'student' | 'teacher' | 'developer'; // Properly typed role in edit form
  }>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Department');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [departments, setDepartments] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const { exportData, isExporting } = useDataExport();
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [fetchStudents]);

  const fetchStats = async () => {
    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('points, created_at, last_signed_in_at, department');

      if (error) throw error;

      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalStudents = allUsers?.length || 0;
      const activeThisMonth = allUsers?.filter(user =>
        user.last_signed_in_at && new Date(user.last_signed_in_at) >= startOfThisMonth
      ).length || 0;
      const highestPoints = Math.max(...(allUsers?.map(user => user.points || 0) || [0]));
      const departments = new Set(allUsers?.map(user => user.department).filter(Boolean)).size;

      setStats({
        totalStudents,
        activeThisMonth,
        highestPoints,
        departments
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(editForm)
        .eq('id', selectedStudent.id);

      if (error) throw error;

      // Update local state
      setStudents(prev => prev.map(student =>
        student.id === selectedStudent.id ? { ...student, ...editForm } : student
      ));

      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student',
        variant: 'destructive',
      });
    }
  };

  const handleExport = (format: 'csv') => {
    const exportHeaders = [
      'Student ID', 'Name', 'Department', 'Role', 'Points',
      'Status', 'Mobile', 'Shift', 'Created At', 'Last Signed In'
    ];

    const exportRows = filteredStudents.map(student => [
      student.student_id,
      student.name,
      student.department || 'N/A',
      student.role,
      student.points,
      student.status,
      student.mobile_number || 'N/A',
      student.shift === '1' ? 'Morning (1st Shift)' : student.shift === '2' ? 'Evening (2nd Shift)' : 'Full Day',
      new Date(student.created_at).toLocaleDateString(),
      student.last_signed_in_at ? new Date(student.last_signed_in_at).toLocaleDateString() : 'Never'
    ]);

    exportData({
      headers: exportHeaders,
      data: exportRows,
      filename: `students-${new Date().toISOString().split('T')[0]}`
    }, format);
  };

  // Filtered students with all filters
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      !departmentFilter || departmentFilter === 'All Department' || departmentFilter === 'all' || student.department === departmentFilter;
    const matchesShift =
      shiftFilter === 'all' ||
      (shiftFilter === 'morning' && student.shift === '1') ||
      (shiftFilter === 'evening' && student.shift === '2') ||
      (shiftFilter === 'full' && student.shift === 'full');
    const matchesRole =
      roleFilter === 'all' || student.role === roleFilter;

    return matchesSearch && matchesDepartment && matchesShift && matchesRole;
  });

  const handleEditProfile = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      department: student.department,
      mobile_number: student.mobile_number,
      status: student.status,
      shift: student.shift,
      role: student.role // Now properly typed
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenPasswordReset = (student: Student) => {
    setSelectedStudent(student);
    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsPasswordResetDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;

    if (resetPasswordForm.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      // Use Supabase Admin API to update user password
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: selectedStudent.id,
          newPassword: resetPasswordForm.newPassword
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Password updated successfully for ${selectedStudent.name}. Share the new password with the student securely.`,
      });
      setIsPasswordResetDialogOpen(false);
      setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const getShiftDisplay = (shift: string) => {
    switch (shift) {
      case '1': return 'Morning (1st Shift)';
      case '2': return 'Evening (2nd Shift)';
      case 'full': return 'Full Day';
      default: return shift;
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students Management</h1>
            <p className="text-purple-100">Manage student accounts and view their progress</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Student
            </Button>
            <Button
              onClick={() => setIsBulkUploadOpen(true)}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
            >
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Button>
          </div>
        </div>
      </div>


      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-800">{stats.totalStudents}</div>
            <div className="text-xs text-blue-600">Total Students</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-800">{stats.activeThisMonth}</div>
            <div className="text-xs text-green-600">Active This Month</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-yellow-800">{stats.highestPoints}</div>
            <div className="text-xs text-yellow-600">Highest Points</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-800">{stats.departments}</div>
            <div className="text-xs text-purple-600">Departments</div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Filter/Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            type="text"
            placeholder="Search by name, ID, email, or department"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <DepartmentCombobox
            value={departmentFilter}
            onChange={setDepartmentFilter}
            placeholder="Select department"
          />
        </div>
        <div>
          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              <SelectItem value="morning">Morning (1st Shift)</SelectItem>
              <SelectItem value="evening">Evening (2nd Shift)</SelectItem>
              <SelectItem value="full">Full Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-800 text-lg">All Students ({filteredStudents.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchStudents}
                disabled={loading}
                className="text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting || filteredStudents.length === 0}
                className="text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Student ID</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs">Shift</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Points</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Last Signed In</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-sm">{student.student_id}</TableCell>
                    <TableCell className="text-sm">{student.name}</TableCell>
                    <TableCell className="text-sm">{student.department || 'N/A'}</TableCell>
                    <TableCell className="text-sm">{getShiftDisplay(student.shift)}</TableCell>
                    <TableCell className="text-sm">{student.role}</TableCell>
                    <TableCell className="text-sm">
                      <Badge className={`${student.points > 1000 ? 'bg-yellow-100 text-yellow-800' :
                        student.points > 800 ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        } text-xs`}>
                        <Trophy className="h-3 w-3 mr-1" />
                        {student.points}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className={`${student.status === 'active' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                        } text-xs`}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {student.last_signed_in_at
                        ? new Date(student.last_signed_in_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleEditProfile(student)}
                          className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-xs h-7"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPasswordReset(student)}
                          className="text-xs h-7 border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <KeyRound className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-sm">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Name</label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={editForm.email || ''}
                      readOnly
                      className="text-sm h-8 bg-gray-50 border-gray-200 cursor-not-allowed"
                      placeholder="Email"
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-3 pointer-events-none">
                      <span className="text-xs text-gray-500">Read-only</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Department</label>
                  <DepartmentCombobox
                    value={editForm.department || ''}
                    onChange={(value) => setEditForm({ ...editForm, department: value })}
                    placeholder="Select department"
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Mobile</label>
                  <Input
                    value={editForm.mobile_number || ''}
                    onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Shift</label>
                  <Select
                    value={editForm.shift || '1'}
                    onValueChange={(value) => setEditForm({ ...editForm, shift: value })}
                  >
                    <SelectTrigger className="text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning (1st Shift)">Morning (1st Shift)</SelectItem>
                      <SelectItem value="Evening (2nd Shift)">Evening (2nd Shift)</SelectItem>
                      <SelectItem value="Full Shift">Full Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Role</label>
                  <Select
                    value={editForm.role || 'student'}
                    onValueChange={(value: 'admin' | 'student' | 'teacher' | 'developer') =>
                      setEditForm({ ...editForm, role: value })
                    }
                  >
                    <SelectTrigger className="text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <Select
                    value={editForm.status || 'active'}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger className="text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleUpdateStudent}
                  className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Student Modal */}
      <AddStudentModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onStudentAdded={fetchStudents}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onUploadComplete={fetchStudents}
      />

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="text-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-orange-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {selectedStudent?.name} ({selectedStudent?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                <p className="text-xs text-amber-800">
                  ⚠️ After resetting, share the new password with the student securely via external communication (phone, in-person, etc.)
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-700">New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                    className="text-sm h-9 mt-1"
                    disabled={isResettingPassword}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                    className="text-sm h-9 mt-1"
                    disabled={isResettingPassword}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword || !resetPasswordForm.newPassword || !resetPasswordForm.confirmPassword}
                  className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm flex-1"
                >
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordResetDialogOpen(false)}
                  disabled={isResettingPassword}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminStudentManagement;
