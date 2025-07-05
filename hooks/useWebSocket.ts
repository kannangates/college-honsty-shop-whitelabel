
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    // Use Supabase real-time for WebSocket functionality
    const channel = supabase.channel('realtime-updates');
    
    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        setLastMessage({
          type: 'order_update',
          payload,
          timestamp: Date.now()
        });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, (payload) => {
        setLastMessage({
          type: 'inventory_update',
          payload,
          timestamp: Date.now()
        });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        setLastMessage({
          type: 'user_update',
          payload,
          timestamp: Date.now()
        });
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return channel;
  };

  useEffect(() => {
    const channel = connect();

    return () => {
      channel.unsubscribe();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    // For sending custom messages, we can use Supabase functions
    supabase.functions.invoke('broadcast-message', {
      body: { ...message, timestamp: Date.now() }
    });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
};
