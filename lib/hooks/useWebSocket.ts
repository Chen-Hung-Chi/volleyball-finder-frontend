"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { toast } from 'react-toastify';

export const useWebSocket = (userId?: string) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const getWebSocketUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    try {
      const url = new URL(apiUrl);
      const protocol = url.protocol === 'https:' ? 'wss' : 'ws';
      const port = url.port ? `:${url.port}` : '';
      return `${protocol}://${url.hostname}${port}/ws`;
    } catch {
      return 'ws://localhost:8080/ws';
    }
  };

  const handleNotification = useCallback((message: IMessage) => {
    try {
      const notification = JSON.parse(message.body);
      if (notification?.message) {
        toast.info(notification.message, { toastId: "ws-notification" });
      }
    } catch (error) {
      console.error('Failed to parse notification:', error);
    }
  }, []);

  const connect = useCallback(() => {
    if (!userId || clientRef.current?.active) return;

    const stompClient = new Client({
      brokerURL: getWebSocketUrl(),
      connectHeaders: { userId },
      debug: (str) => { }, // silent unless debug
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      stompClient.subscribe(`/user/${userId}/queue/notifications`, handleNotification);
    };

    stompClient.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message'], frame.body);
      setIsConnected(false);
    };

    stompClient.activate();
    clientRef.current = stompClient;
  }, [userId, handleNotification]);

  const disconnect = useCallback(async () => {
    console.log('Disconnecting WebSocket...');
    if (clientRef.current) {
      try {
        await clientRef.current.deactivate();
      } catch (error) {
        console.error('Error deactivating WebSocket:', error);
      } finally {
        clientRef.current = null;
        setIsConnected(false);
      }
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!clientRef.current?.active || !isConnected) {
      console.warn('WebSocket not connected');
      throw new Error('WebSocket is not connected');
    }
    clientRef.current.publish({
      destination: '/app/notifications.markAsRead',
      body: JSON.stringify({ notificationId }),
      headers: { 'content-type': 'application/json' }
    });
  }, [isConnected]);

  useEffect(() => {
    if (userId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    isConnected,
    markAsRead,
  };
};