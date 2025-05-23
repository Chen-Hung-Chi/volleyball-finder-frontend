import React from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2 } from 'lucide-react';
import { apiService } from "@/lib/apiService";
import { NotificationItem } from './NotificationItem';
import { NotificationDropdownProps } from './type'; // Import from local type file

export const NotificationDropdown = React.memo(({ 
  isLoading, 
  error, 
  notifications, 
  setNotifications,
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

    const handleMarkAllAsRead = async () => {
      try {
        await apiService.markAllNotificationsAsRead();
        console.log("All notifications marked as read");
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      } catch (err) {
        console.error("Failed to mark all as read", err);
      }
    };

    return (
      <div className="max-h-96 overflow-y-auto">
        <div className="flex justify-end p-2 border-b bg-muted">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            全部標為已讀
          </button>
        </div>
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification}
            setNotifications={setNotifications}
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