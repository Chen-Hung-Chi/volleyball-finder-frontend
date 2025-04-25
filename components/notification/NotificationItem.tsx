import React from 'react';
import { Button } from '@/components/ui/button';
import { cn, formatTaipeiTime } from '@/lib/utils';
import { Notification } from '@/lib/types/notification';
import { NotificationItemProps } from './type'; // Import from local type file

export const NotificationItem = React.memo(({ notification, onMarkAsRead }: NotificationItemProps) => (
  <div
    key={notification.id}
    className={cn(
      "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0",
      !notification.read && "bg-blue-50 dark:bg-blue-900/20"
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
        {formatTaipeiTime(notification.createdAt)}
      </p>
      {!notification.read && (
        <Button
          variant="link"
          size="sm"
          className="text-xs h-auto p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={(e) => {
            e.stopPropagation(); // Prevent closing dropdown
            onMarkAsRead(notification.id);
          }}
        >
          標記為已讀
        </Button>
      )}
    </div>
  </div>
));

NotificationItem.displayName = 'NotificationItem'; 