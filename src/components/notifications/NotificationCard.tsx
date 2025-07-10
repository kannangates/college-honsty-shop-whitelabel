import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Pin } from 'lucide-react';
import html2canvas from 'html2canvas';

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
    imageUrl?: string; 
  };
  onMarkAsRead: (id: string) => void;
  onReactionUpdate: (id: string, type: 'reach' | 'share') => void;
}

// --- ANNOUNCEMENT PLACEHOLDER ---
// A simple, reusable SVG placeholder for announcements without an image
const AnnouncementPlaceholder = () => (
  <div className="w-full aspect-video bg-zinc-800 flex items-center justify-center p-4">
    <div className="text-center text-zinc-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <p className="text-xs font-semibold mt-2">ANNOUNCEMENT</p>
    </div>
  </div>
);


// --- MAIN COMPONENT ---
export const NotificationCard = ({ notification, onMarkAsRead, onReactionUpdate }: NotificationCardProps) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- MODIFIED: Changed "Star" to "Claps" ---
  const reactions = [
    { icon: '❤️', label: 'Love' },
    { icon: '👍', label: 'Like' },
    { icon: '👏', label: 'Claps' }, // Changed from Star
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
      cardRef.current.classList.add('is-exporting');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1C1C1E',
        scale: 2,
        useCORS: true,
      });
      cardRef.current.classList.remove('is-exporting');
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vibes-notification-${notification.id}.png`;
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
      'top_rank_change': { emoji: '🏆', className: 'bg-yellow-400/20 text-yellow-300' },
      'badge_earned': { emoji: '🎖️', className: 'bg-green-400/20 text-green-300' },
      'announcement': { emoji: '📢', className: 'bg-blue-400/20 text-blue-300' },
      'payment_reminder': { emoji: '💸', className: 'bg-red-400/20 text-red-300' },
      'default': { emoji: '🔔', className: 'bg-gray-400/20 text-gray-300' },
    };
    const { emoji, className } = typeMap[type] || typeMap['default'];
    return (
      <Badge className={`border-none font-normal text-xs ${className}`}>
        {emoji} {type.replace(/_/g, ' ')}
      </Badge>
    );
  };
  
  return (
    <Card
      ref={cardRef}
      data-pinned={notification.is_pinned}
      className={`
        bg-zinc-900 text-gray-50 border-zinc-800 rounded-2xl overflow-hidden shadow-lg
        transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-cyan-400/10
        ${!notification.is_read ? 'border-l-4 border-l-cyan-400' : 'border'}
        ${notification.is_pinned ? 'sticky top-4 z-10' : ''}
      `}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight text-gray-50">
              {notification.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {notification.body}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getTypeBadge(notification.type)}
            {notification.is_pinned && <Pin className="h-4 w-4 text-yellow-400" />}
          </div>
        </div>
      </div>

      {/* === MODIFIED: Image rendering logic === */}
      {/* If there's an image URL, show the image */}
      {notification.imageUrl && (
        <div className="w-full aspect-video bg-zinc-800">
          <img 
            src={notification.imageUrl} 
            alt={notification.title} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      {/* If NO image URL AND it's an announcement, show the placeholder */}
      {!notification.imageUrl && notification.type === 'announcement' && (
        <AnnouncementPlaceholder />
      )}

      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1">
          {reactions.map((reaction) => (
            <Button
              key={reaction.label}
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleReaction(reaction.label); }}
              className={`
                rounded-full w-10 h-10 text-lg transition-transform duration-200
                hover:scale-125
                ${selectedReaction === reaction.label ? 'bg-zinc-700 scale-110' : ''}
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
            className="h-9 px-3 rounded-full hover:bg-zinc-800"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <span className="text-xs font-mono text-gray-500">
            {getRelativeTime(notification.created_at)}
          </span>
        </div>
      </div>
    </Card>
  );
};