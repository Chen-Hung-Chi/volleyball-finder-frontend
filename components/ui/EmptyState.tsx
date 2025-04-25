import { Inbox } from 'lucide-react'; // 或者選擇其他合適的圖標
import React from 'react'; // Import React

interface EmptyStateProps {
  title?: string;
  message: string;
  children?: React.ReactNode; // Add children prop
}

export function EmptyState({ 
  title = "暫無資料", 
  message,
  children // Destructure children
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      {children && <div className="mt-4">{children}</div>} {/* Render children if provided */}
    </div>
  );
} 