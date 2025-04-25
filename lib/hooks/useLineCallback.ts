import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function useLineCallback() {
  const { setUser } = useAuth();
  const urlParams = useSearchParams();

  useEffect(() => {
    const token = urlParams?.get('token');
    const userJsonParam = urlParams?.get('user');

    if (token && userJsonParam) {
      try {
        const decodedUserJson = decodeURIComponent(userJsonParam);
        const user = JSON.parse(decodedUserJson);
        
        setUser(user);
        localStorage.setItem('token', token);

        // 清除 URL 參數，避免重新整理時再次觸發
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.error("Failed to process LINE login data:", e); // 保留 console.error 以供開發調試
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, [urlParams, setUser]);
} 