import React from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { NotificationBellTriggerProps } from './type'; // Import from local type file

export const NotificationBellTrigger = React.memo(({
  unreadCount,
  onClick,
  isVisible
}: NotificationBellTriggerProps) => {
  const hasUnread = unreadCount > 0;
  const ariaLabel = hasUnread ? `通知，有 ${unreadCount} 則未讀` : '通知';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "bell-button relative", // Keep class for outside click detection
        hasUnread && "after:absolute after:top-1 after:right-1 after:h-2 after:w-2 after:rounded-full after:bg-red-500"
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isVisible}
      aria-haspopup="true"
    >
      <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
    </Button>
  );
});

NotificationBellTrigger.displayName = 'NotificationBellTrigger';