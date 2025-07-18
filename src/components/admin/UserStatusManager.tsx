
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/features/gamification/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, UserX, AlertTriangle, Edit } from 'lucide-react';
import { EditStudentModal } from './EditStudentModal';

interface User {
  id: string;
  name: string;
  student_id: string;
  email: string | null;
  department: string | null;
  mobile_number: string | null;
  status: 'active' | 'inactive';
  role: string;
  points: number | null;
}

interface UserStatusManagerProps {
  user: User;
  onStatusChange: () => void;
}

export const UserStatusManager = ({ user, onStatusChange }: UserStatusManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(user.status);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'inactive':
        return <UserX className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === user.status) {
      setDialogOpen(false);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // If deactivating, sign out the user
      if (newStatus === 'inactive' && user.status === 'active') {
        await supabase.auth.admin.signOut(user.id);
      }

      toast({
        title: 'Status Updated',
        description: `User ${user.name} status changed to ${newStatus}`,
      });

      onStatusChange();
      setDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
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
    <>
      <div className="flex gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Badge 
              className={`cursor-pointer hover:opacity-80 ${getStatusColor(user.status)}`}
              variant="secondary"
            >
              {getStatusIcon(user.status)}
              <span className="ml-1 capitalize">{user.status}</span>
            </Badge>
          </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Status</DialogTitle>
          <DialogDescription>
            Update the account status for {user.name} ({user.student_id})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-medium">Student ID:</span> {user.student_id}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.role}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>Active - Full access</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-gray-600" />
                    <span>Inactive - Login disabled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Status Change Effects:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li><strong>Active:</strong> User can login and access all features</li>
                  <li><strong>Inactive:</strong> User cannot login but data is preserved</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={loading || newStatus === user.status}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Button
      variant="ghost"
      size="sm"
      onClick={() => setEditModalOpen(true)}
      className="text-blue-600 hover:text-blue-800"
    >
      <Edit className="h-4 w-4" />
    </Button>
  </div>

  <EditStudentModal
    open={editModalOpen}
    onOpenChange={setEditModalOpen}
    student={user}
    onStudentUpdated={onStatusChange}
  />
</>
  );
};
