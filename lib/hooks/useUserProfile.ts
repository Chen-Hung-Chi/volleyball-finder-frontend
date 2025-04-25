import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { apiService } from '@/lib/api';
import { User, Activity } from '@/lib/types';

export function useUserProfile(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('無效的使用者 ID');
        setIsLoading(false);
        // Optionally redirect immediately
        // toast.error('無效的使用者 ID');
        // router.push('/');
        return;
      }

      setIsLoading(true);
      setError(null);
      setUser(null); // Reset user on new ID fetch
      setActivities([]); // Reset activities on new ID fetch

      try {
        // Fetch user profile and activities concurrently
        const [userData, activitiesData] = await Promise.all([
          apiService.getUserProfile(userId),
          apiService.getUserActivities(userId)
        ]);
        setUser(userData);
        setActivities(activitiesData);
      } catch (err: any) {
        console.error('Error fetching user profile data:', err);
        let errorMessage = '無法載入使用者資訊';
        if (err.code === 'USER_NOT_FOUND' || err?.response?.status === 404) {
            errorMessage = '找不到此使用者';
        } else if (err?.response?.status === 401 || err?.response?.status === 403) {
            errorMessage = '您沒有權限查看此頁面，請先登入';
            // Redirect to login if unauthorized
            // setTimeout(() => router.push('/login'), 1500);
        }
        setError(errorMessage);
        // toast.error(errorMessage); // Let the page component decide whether to toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, router]); // Add router to dependency array if used for redirect

  return { user, activities, isLoading, error };
} 