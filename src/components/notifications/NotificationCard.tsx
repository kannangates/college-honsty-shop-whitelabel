import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Share2, Pin } from 'lucide-react';

// --- PROPS INTERFACE ---
interface NotificationCardProps {
  notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    created_at: string;
    is_pinned: boolean;
    is_read: boolean;
    reach_count: number;
    shared_count: number;
  };
  onMarkAsRead: (id: string) => void;
  onReactionUpdate: (id: string, type: 'reach' | 'share') => void;
}


// --- MAIN COMPONENT ---
export const NotificationCard = ({ notification, onMarkAsRead, onReactionUpdate }: NotificationCardProps) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const reactions = [
    { icon: '❤️', label: 'Love' },
    { icon: '👍', label: 'Like' },
    { icon: '👏', label: 'Claps' },
    { icon: '😊', label: 'Happy' },
  ];

  const handleReaction = (reactionLabel: string) => {
    setSelectedReaction((prev) => (prev === reactionLabel ? null : reactionLabel));
    onReactionUpdate(notification.id, 'reach');
  };

  const handleShare = async () => {
    onReactionUpdate(notification.id, 'share');
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      cardRef.current.classList.add('is-exporting');
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      cardRef.current.classList.remove('is-exporting');
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notification-${notification.id}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting notification:', error);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { emoji: string; className: string } } = {
      'top_rank_change': { emoji: '🏆', className: 'bg-amber-100 text-amber-800' },
      'badge_earned': { emoji: '🎖️', className: 'bg-emerald-100 text-emerald-800' },
      'announcement': { emoji: '📢', className: 'bg-blue-100 text-blue-800' },
      'payment_reminder': { emoji: '💸', className: 'bg-rose-100 text-rose-800' },
      'default': { emoji: '🔔', className: 'bg-slate-100 text-slate-800' },
    };
    const { emoji, className } = typeMap[type] || typeMap['default'];
    return (
      <Badge className={`border-none font-medium text-xs ${className}`}>
        {emoji} {type.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <Card
      ref={cardRef}
      data-pinned={notification.is_pinned}
      className={`
        bg-white text-slate-800 border border-slate-200/80 rounded-2xl overflow-hidden
        transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-violet-200/50
        ${!notification.is_read ? 'border-l-4 border-l-violet-500' : 'border'}
        ${notification.is_pinned ? 'sticky top-4 z-10 ring-2 ring-violet-300' : ''}
      `}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight text-slate-900">
              {notification.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {notification.body}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getTypeBadge(notification.type)}
            {notification.is_pinned && <Pin className="h-4 w-4 text-violet-500" />}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
          {reactions.map((reaction) => (
            <Button
              key={reaction.label}
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleReaction(reaction.label); }}
              className={`
                rounded-full w-10 h-10 text-lg transition-transform duration-200
                hover:scale-125
                ${selectedReaction === reaction.label ? 'bg-violet-100 scale-110' : ''}
              `}
            >
              {reaction.icon}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="h-9 px-3 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <span className="text-xs font-mono text-slate-500">
            {getRelativeTime(notification.created_at)}
          </span>
        </div>
      </div>
    </Card>
  );
};