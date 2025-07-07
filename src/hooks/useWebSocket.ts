
import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: unknown;
}

export const useWebSocket = (url: string, onMessage?: (message: WebSocketMessage) => void) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, onMessage]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      const currentReconnectTimeout = reconnectTimeoutRef.current;
      if (currentReconnectTimeout) {
        clearTimeout(currentReconnectTimeout);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    sendMessage,
    disconnect,
    isConnected: ws.current?.readyState === WebSocket.OPEN
  };
};
