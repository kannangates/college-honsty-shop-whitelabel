import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    updateReactionCount
  } = useNotifications();

  if (loading) {
    return <LoadingSpinner />;
  }

  const pinnedNotifications = notifications.filter(n => n.is_pinned);
  const regularNotifications = notifications.filter(n => !n.is_pinned);
  const sortedNotifications = [...pinnedNotifications, ...regularNotifications];

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-3 py-1">
                  {unreadCount} unread
                </Badge>
              )}
            </h1>
            <p className="text-purple-100">Stay updated with your latest activities and announcements</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={markAllAsRead}
          className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white"
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All as Read
        </Button>
        <Button 
          variant="outline"
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Notifications
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {sortedNotifications.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500">
                You'll see your notifications here when you receive them
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedNotifications.map((notification) => (
            // 👇 THIS WRAPPER DIV IS THE IMPORTANT CHANGE FOR CENTERING 👇
            <div key={notification.id} className="max-w-xl mx-auto">
                <NotificationCard
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onReactionUpdate={updateReactionCount}
                />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;