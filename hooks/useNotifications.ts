
import { useState, useEffect } from 'react';
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

  const fetchNotifications = async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔔 Fetching notifications for user:', user.id, 'department:', profile.department);
      
      // Fetch all notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.error('❌ Error fetching notifications:', notificationsError);
        throw notificationsError;
      }

      console.log('📋 All notifications fetched:', notificationsData?.length || 0);

      // Filter notifications based on targeting rules
      const filteredNotifications = notificationsData?.filter(notification => {
        // If targeted to specific user
        if (notification.target_user_id === user.id) {
          console.log('✅ Notification targeted to user:', notification.title);
          return true;
        }
        
        // If no target user and no department filter (broadcast to all)
        if (!notification.target_user_id && (!notification.department || notification.department.length === 0)) {
          console.log('✅ Broadcast notification:', notification.title);
          return true;
        }
        
        // If department filter exists, check if user's department is included
        if (!notification.target_user_id && notification.department && profile.department) {
          const isIncluded = notification.department.includes(profile.department);
          console.log('🏢 Department filter check:', notification.title, 'user dept:', profile.department, 'target depts:', notification.department, 'included:', isIncluded);
          return isIncluded;
        }
        
        console.log('❌ Notification filtered out:', notification.title);
        return false;
      }) || [];

      console.log('📱 Filtered notifications:', filteredNotifications.length);

      // Fetch read status for each notification
      const notificationIds = filteredNotifications.map(n => n.id);
      const { data: readData, error: readError } = await supabase
        .from('notification_reads')
        .select('notification_id, is_read, read_at')
        .eq('user_id', user.id)
        .in('notification_id', notificationIds);

      if (readError) {
        console.error('❌ Error fetching read status:', readError);
      }

      console.log('👁️ Read status data:', readData?.length || 0, 'records');

      // Process notifications with read status
      const processedNotifications = filteredNotifications.map(notification => {
        const readRecord = readData?.find(r => r.notification_id === notification.id);
        return {
          ...notification,
          is_read: readRecord?.is_read || false,
          read_at: readRecord?.read_at || null
        };
      });

      console.log('✅ Processed notifications:', processedNotifications.length);
      setNotifications(processedNotifications);
      
      const unread = processedNotifications.filter(n => !n.is_read).length;
      console.log('🔴 Unread count:', unread);
      setUnreadCount(unread);
    } catch (error) {
      console.error('❌ Error in fetchNotifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, profile]);

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
