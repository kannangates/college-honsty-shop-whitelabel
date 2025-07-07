import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
  is_pinned: boolean;
  pin_till: string | null;
  department: string[] | null;
  target_user_id: string | null;
  reach_count: number;
  shared_count: number;
  is_read: boolean;
  read_at: string | null;
}

export const useNotifications = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_user_id.eq.${user.id},target_user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      console.log('📖 Marking notification as read:', notificationId);
      
      // Check if read record exists
      const { data: existingRead } = await supabase
        .from('notification_reads')
        .select('id')
        .eq('notification_id', notificationId)
        .eq('user_id', user.id)
        .single();

      if (existingRead) {
        // Update existing record
        await supabase
          .from('notification_reads')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('notification_id', notificationId)
          .eq('user_id', user.id);
      } else {
        // Create new read record
        await supabase
          .from('notification_reads')
          .insert({
            notification_id: notificationId,
            user_id: user.id,
            is_read: true,
            read_at: new Date().toISOString()
          });
      }

      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      console.log('📖 Marking all notifications as read:', unreadNotifications.length);
      
      for (const notification of unreadNotifications) {
        // Check if read record exists
        const { data: existingRead } = await supabase
          .from('notification_reads')
          .select('id')
          .eq('notification_id', notification.id)
          .eq('user_id', user.id)
          .single();

        if (existingRead) {
          // Update existing record
          await supabase
            .from('notification_reads')
            .update({
              is_read: true,
              read_at: new Date().toISOString()
            })
            .eq('notification_id', notification.id)
            .eq('user_id', user.id);
        } else {
          // Create new read record
          await supabase
            .from('notification_reads')
            .insert({
              notification_id: notification.id,
              user_id: user.id,
              is_read: true,
              read_at: new Date().toISOString()
            });
        }
      }

      // Update local state
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true,
        read_at: notification.read_at || new Date().toISOString()
      })));
      
      setUnreadCount(0);

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'Success',
        description: 'All notifications cleared',
      });
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        variant: 'destructive',
      });
    }
  };

  const updateReactionCount = async (notificationId: string, reactionType: 'reach' | 'share') => {
    try {
      const field = reactionType === 'reach' ? 'reach_count' : 'shared_count';
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      await supabase
        .from('notifications')
        .update({
          [field]: (notification[field] || 0) + 1
        })
        .eq('id', notificationId);

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, [field]: (n[field] || 0) + 1 }
          : n
      ));
    } catch (error) {
      console.error(`❌ Error updating ${reactionType} count:`, error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    updateReactionCount,
    fetchNotifications
  };
};
