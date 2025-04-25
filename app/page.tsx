"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SearchForm } from "@/components/activity/SearchForm"
import { useAuth } from "@/lib/auth-context"
import { ActivityList } from "@/components/activity/ActivityList"
import { CustomPagination } from "@/components/ui/pagination"
import { ActivityListSkeleton } from "@/components/activity/ActivityListSkeleton"
import { useActivitySearch } from "@/lib/hooks/useActivitySearch"
import { useLineCallback } from "@/lib/hooks/useLineCallback"
import { useGlobalErrorHandler } from "@/lib/hooks/useGlobalErrorHandler"
import { EmptyState } from "@/components/ui/EmptyState"

// Define the new component containing the original HomePage logic
function HomePageContent() {
  const { setUser } = useAuth()
  const urlParams = useSearchParams()

  // Use custom hooks
  useLineCallback();
  useGlobalErrorHandler();
  const {
    activities,
    totalPages,
    currentPage,
    isLoading,
    searchParams,
    triggerSearch,
    handlePageChange
  } = useActivitySearch();

  // 處理 LINE 登入回調
  useEffect(() => {
    const token = urlParams?.get('token');
    const userJsonParam = urlParams?.get('user');

    if (token && userJsonParam) {
      try {
        const decodedUserJson = decodeURIComponent(userJsonParam);
        const user = JSON.parse(decodedUserJson);
        
        setUser(user);
        localStorage.setItem('token', token);

        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, [urlParams, setUser]);

  // 添加全局錯誤處理
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      if (!errorString.includes('AxiosError') && 
          !errorString.includes('Network Error') &&
          !errorString.includes('XMLHttpRequest')) {
        originalError.apply(console, args);
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="container max-w-7xl py-6">
      <div className="space-y-6">
        <SearchForm onSearch={triggerSearch} initialValues={searchParams} />
        
        {isLoading ? (
          <ActivityListSkeleton />
        ) : activities.length > 0 ? (
          <>
            <ActivityList activities={activities} />
            <CustomPagination 
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState message="目前沒有符合條件的活動" />
        )}
      </div>
    </div>
  );
}

// Updated HomePage component using Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<ActivityListSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

