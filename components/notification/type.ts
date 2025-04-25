import React from 'react';
import { Notification } from '@/lib/types/notification';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export interface NotificationDropdownProps {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  isVisible: boolean;
}

export interface NotificationBellTriggerProps {
  unreadCount: number;
  onClick: (event: React.MouseEvent) => void;
  isVisible: boolean;
}
