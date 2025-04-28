import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Activity } from '@/lib/types';
import { apiService } from '@/lib/apiService';

export function useMyActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getMyActivities();
      setActivities(data);
    } catch (err: any) {
      console.error('Failed to fetch my activities:', err);
      setError(err);
      // 保留 toast 錯誤提示，因為這是用戶操作觸發的數據加載
      toast.error("無法載入我的活動列表");
      setActivities([]); // Clear activities on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchMyActivities();
  }, [fetchMyActivities]);

  return { activities, isLoading, error, refetch: fetchMyActivities };
} 