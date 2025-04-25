import React from 'react';
import { Button } from '@/components/ui/button';
import { BellIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBellTriggerProps } from './type'; // Import from local type file

export const NotificationBellTrigger = React.memo(({ 
  unreadCount, 
  onClick, 
  isVisible 
}: NotificationBellTriggerProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "bell-button relative", // Keep class for outside click detection
        unreadCount > 0 && "after:absolute after:top-1 after:right-1 after:h-2 after:w-2 after:rounded-full after:bg-red-500"
      )}
      onClick={onClick}
      aria-label={`通知 ${unreadCount > 0 ? `，有 ${unreadCount} 則未讀` : ''}`}
      aria-expanded={isVisible}
      aria-haspopup="true"
    >
      <BellIcon className="h-5 w-5" />
    </Button>
  );
});

NotificationBellTrigger.displayName = 'NotificationBellTrigger'; 