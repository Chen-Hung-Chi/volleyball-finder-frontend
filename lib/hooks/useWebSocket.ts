import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/auth-context';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

export const useWebSocket = (userId?: string) => {
  const client = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!userId) return;

    client.current = new Client({
      brokerURL: SOCKET_URL,
      connectHeaders: {
        userId: userId,
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.current.onConnect = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      
      // Subscribe to user-specific notifications
      if (client.current && userId) {
        client.current.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            toast.info(notification.message);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });
      }
    };

    client.current.onDisconnect = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    client.current.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setIsConnected(false);
    };

    try {
      client.current.activate();
    } catch (error) {
      console.error('Error activating WebSocket client:', error);
      setIsConnected(false);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    if (client.current) {
      try {
        client.current.deactivate();
        client.current = null;
        setIsConnected(false);
      } catch (error) {
        console.error('Error disconnecting WebSocket client:', error);
      }
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (!client.current || !isConnected) {
      console.error('WebSocket is not connected');
      return Promise.reject(new Error('WebSocket is not connected'));
    }

    return new Promise((resolve, reject) => {
      try {
        client.current!.publish({
          destination: '/app/notifications.markAsRead',
          body: JSON.stringify(notificationId),
          headers: { 'content-type': 'application/json' }
        });
        resolve(true);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        reject(error);
      }
    });
  }, [isConnected]);

  useEffect(() => {
    if (userId) {
      connect();
    }
    return () => disconnect();
  }, [userId, connect, disconnect]);

  return { 
    client: client.current,
    isConnected,
    markAsRead
  };
}; 