import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { apiService } from '@/lib/api';
import { Activity } from '@/lib/types/activity';
import { SearchParams } from '@/lib/types/api';

// 默認搜索參數
const defaultSearchParams: SearchParams = {
  page: 1,
  limit: 12,
  startDate: format(new Date(), "yyyy-MM-dd"),
  title: "",
  city: undefined,
  district: undefined,
};

// 構建搜索參數
const buildSearchParams = (params: Partial<SearchParams>): SearchParams => {
  return {
    ...defaultSearchParams,
    ...params,
    limit: params.limit || defaultSearchParams.limit
  };
};

export function useActivitySearch() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);

  // 在客戶端加載時恢復搜索狀態和結果
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('homePageState');
      if (savedState) {
        const { params, page } = JSON.parse(savedState);
        // 直接調用內部 handleSearch
        handleSearch(buildSearchParams({ ...params, page }), false); 
      } else {
        handleSearch(defaultSearchParams, false);
      }
    } catch (e) {
      handleSearch(defaultSearchParams, false);
    }
  }, []);

  const handleSearch = useCallback(async (params: SearchParams, saveState = true) => {
    setIsLoading(true);
    try {
      const result = await apiService.searchActivities(params);
      setSearchParams(params);
      setActivities(result.items);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
      
      if (saveState) {
          sessionStorage.setItem('homePageState', JSON.stringify({
          params,
          page: result.page
        }));
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error("您沒有權限查看活動列表");
      } else if (err?.response?.status === 401) {
        toast.error("請先登入");
      } else {
        toast.error("載入活動列表時發生錯誤，請稍後再試");
      }
      setActivities([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    const newParams = buildSearchParams({ 
      ...searchParams, 
      page: selected + 1 
    });
    handleSearch(newParams);
  }, [searchParams, handleSearch]);

  // 暴露給外部使用的觸發搜索的函數
  const triggerSearch = useCallback((params: Partial<SearchParams>) => {
      handleSearch(buildSearchParams(params));
  }, [handleSearch]);

  return {
    activities,
    totalPages,
    currentPage,
    isLoading,
    searchParams,
    triggerSearch, // 暴露觸發搜索的方法
    handlePageChange
  };
} 