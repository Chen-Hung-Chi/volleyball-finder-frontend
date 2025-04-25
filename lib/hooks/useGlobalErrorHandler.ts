import { useEffect } from 'react';

export function useGlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // 過濾常見的、通常不需要打斷用戶的網絡錯誤
      if (event.message.includes('Network Error') || 
          event.message.includes('Failed to fetch') ||
          event.message.includes('Load failed')) { // 某些瀏覽器可能這樣顯示
        // 可以選擇性地在這裡記錄到你的監控系統，但不顯示給用戶
        console.warn('Suppressed network error:', event.message);
        event.preventDefault(); // 阻止瀏覽器預設的控制台輸出
      }
      // 其他錯誤仍會顯示在控制台
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
        // 處理未捕獲的 Promise 拒絕，例如 AxiosError
        if (event.reason?.isAxiosError) {
            console.warn('Suppressed Axios error:', event.reason.message);
            event.preventDefault();
        } else if (event.reason instanceof Error && 
                   (event.reason.message.includes('Network Error') || event.reason.message.includes('Failed to fetch'))) {
            console.warn('Suppressed unhandled promise network error:', event.reason.message);
            event.preventDefault();
        }
        // 其他未處理的 rejection 仍會顯示
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // 組件卸載時移除監聽器
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
} 