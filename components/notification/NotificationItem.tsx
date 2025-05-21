import React from 'react';
import { apiService } from "@/lib/apiService";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { NotificationItemProps } from './type';

interface ExtendedNotificationItemProps extends NotificationItemProps {
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
}

export const NotificationItem = React.memo(({ 
  notification, 
  setNotifications 
}: ExtendedNotificationItemProps) => {
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    // e.stopPropagation(); // Prevent closing dropdown - REMOVED
    
    // Immediately update UI
    if (setNotifications) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }
    
    try {
      await apiService.markNotificationAsRead(notification.id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert UI if API call fails
      if (setNotifications) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: false } : n
          )
        );
      }
    }
  };

  return (
    <div
      key={notification.id}
      className={cn(
        "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0",
        !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div className="font-medium text-gray-900 dark:text-gray-100 mb-0.5">
        {notification.title}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {notification.content}
      </div>
      <div className="mt-1 flex justify-between items-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {dayjs(notification.createdAt).format("YYYY/MM/DD HH:mm")}
        </p>
        {!notification.isRead && (
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={handleMarkAsRead}
          >
            標記為已讀
          </Button>
        )}
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';