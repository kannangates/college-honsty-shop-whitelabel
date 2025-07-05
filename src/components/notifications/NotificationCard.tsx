
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Heart, ThumbsUp, Star, Smile, Share, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

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

export const NotificationCard = ({ notification, onMarkAsRead, onReactionUpdate }: NotificationCardProps) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const reactions = [
    { icon: Heart, label: 'Love', color: 'text-red-500' },
    { icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { icon: Star, label: 'Star', color: 'text-yellow-500' },
    { icon: Smile, label: 'Happy', color: 'text-green-500' },
  ];

  const handleReaction = (reactionLabel: string) => {
    setSelectedReaction(reactionLabel);
    onReactionUpdate(notification.id, 'reach');
  };

  const handleShare = async () => {
    onReactionUpdate(notification.id, 'share');
    
    // Export as image
    const cardElement = document.getElementById(`notification-card-${notification.id}`);
    if (cardElement) {
      try {
        const canvas = await html2canvas(cardElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `notification-${notification.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        });
      } catch (error) {
        console.error('Error exporting notification:', error);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'top_rank_change':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'badge_earned':
        return <Heart className="h-5 w-5 text-green-600" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'payment_reminder':
        return <ThumbsUp className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'top_rank_change':
        return 'bg-yellow-100 text-yellow-800';
      case 'badge_earned':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'payment_reminder':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      id={`notification-card-${notification.id}`}
      className={`transition-all hover:shadow-lg ${
        !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'bg-white'
      } ${notification.is_pinned ? 'ring-2 ring-yellow-200' : ''}`}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Left side - Date/Time */}
          <div className="flex-shrink-0 text-center">
            <div className="bg-gray-100 rounded-lg p-3 min-w-[80px]">
              <div className="text-sm font-medium text-gray-900">
                {new Date(notification.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(notification.created_at).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {notification.is_pinned && (
                <Badge className="mt-1 text-xs bg-yellow-100 text-yellow-800">
                  Pinned
                </Badge>
              )}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTypeIcon(notification.type)}
                <h3 className="font-bold text-lg text-gray-900">
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    New
                  </Badge>
                )}
              </div>
              <Badge className={getTypeColor(notification.type)}>
                {notification.type.replace('_', ' ')}
              </Badge>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              {notification.body}
            </p>

            {/* Reactions and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {reactions.map((reaction) => {
                  const ReactionIcon = reaction.icon;
                  return (
                    <Button
                      key={reaction.label}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(reaction.label);
                      }}
                      className={`h-8 px-2 ${
                        selectedReaction === reaction.label 
                          ? 'bg-gray-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <ReactionIcon className={`h-4 w-4 ${reaction.color}`} />
                    </Button>
                  );
                })}
                <span className="text-xs text-gray-500 ml-2">
                  {notification.reach_count > 0 && `${notification.reach_count} reactions`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="h-8 px-3"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
                {notification.shared_count > 0 && (
                  <span className="text-xs text-gray-500">
                    {notification.shared_count} shares
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
