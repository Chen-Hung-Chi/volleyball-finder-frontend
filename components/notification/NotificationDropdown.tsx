import React from 'react';
import { cn } from '@/lib/utils';
import { Notification } from '@/lib/types/notification';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { NotificationDropdownProps } from './type'; // Import from local type file

export const NotificationDropdown = React.memo(({ 
  isLoading, 
  error, 
  notifications, 
  onMarkAsRead,
  isVisible 
}: NotificationDropdownProps) => {
  if (!isVisible) {
    return null; // Don't render if not visible
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (error) {
      return <div className="p-4 text-sm text-center text-destructive dark:text-red-400">{error}</div>;
    }
    if (notifications.length === 0) {
      return <EmptyState title="沒有新通知" message="目前沒有任何通知" />;
    }
    return (
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onMarkAsRead={onMarkAsRead} 
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 overflow-hidden",
        "bg-card border border-border"
      )}
      role="dialog"
      aria-label="通知列表"
      onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
    >
      {renderContent()}
    </div>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown'; 