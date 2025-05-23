import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/apiService';
import { Notification } from "@/lib/types/notification";
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationBellTrigger } from './NotificationBellTrigger';

export const NotificationList = React.memo(function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data: Notification[] = await apiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('無法載入通知');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isVisible && user?.id) {
      fetchNotifications();
    }
  }, [isVisible, user?.id, fetchNotifications]);

  const toggleNotifications = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(v => !v);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const notificationContainer = document.querySelector('.notification-container');
      const bellButton = document.querySelector('.bell-button');

      if (
        isVisible &&
        notificationContainer && !notificationContainer.contains(target) &&
        bellButton && !bellButton.contains(target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible]);

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (!user) {
    return null;
  }

  return (
    <div className="notification-container relative">
      <NotificationBellTrigger 
        unreadCount={unreadCount}
        onClick={toggleNotifications}
        isVisible={isVisible}
      />
      <NotificationDropdown 
        isVisible={isVisible}
        isLoading={isLoading}
        error={error}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
});