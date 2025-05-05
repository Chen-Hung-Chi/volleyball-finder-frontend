import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/apiService';
import { User, Activity } from '@/lib/types';

export function useUserProfile(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resetState = () => {
    setError(null);
    setUser(null);
    setActivities([]);
    setIsLoading(true);
  };

  const parseErrorMessage = (err: any): string => {
    if (err.code === 'USER_NOT_FOUND' || err?.response?.status === 404)
      return '找不到此使用者';
    if (err?.response?.status === 401 || err?.response?.status === 403)
      return '您沒有權限查看此頁面，請先登入';
    return '無法載入使用者資訊';
  };

  useEffect(() => {
    if (!userId) {
      setError('無效的使用者 ID');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      resetState();
      try {
        const [userData, activitiesData] = await Promise.all([
          apiService.getUserProfile(userId),
          apiService.getUserActivities(userId),
        ]);
        setUser(userData);
        setActivities(activitiesData);
      } catch (err: any) {
        console.error('Error fetching user profile data:', err);
        setError(parseErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, router]);

  return { user, activities, isLoading, error };
}