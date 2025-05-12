import React from 'react';
import { Notification } from '@/lib/types/notification';

export interface NotificationItemProps {
  notification: Notification;
}

export interface NotificationDropdownProps {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  isVisible: boolean;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export interface NotificationBellTriggerProps {
  unreadCount: number;
  onClick: (event: React.MouseEvent) => void;
  isVisible: boolean;
}
