"use client"

import { Suspense } from "react"
import { SearchForm } from "@/components/activity/SearchForm"
import { ActivityList } from "@/components/activity/ActivityList"
import { CustomPagination } from "@/components/ui/pagination"
import { ActivityListSkeleton } from "@/components/activity/ActivityListSkeleton"
import { useActivitySearch } from "@/lib/hooks/useActivitySearch"
import { useLineCallback } from "@/lib/hooks/useLineCallback"
import { useGlobalErrorHandler } from "@/lib/hooks/useGlobalErrorHandler"
import { EmptyState } from "@/components/ui/EmptyState"
import { useFcm } from "@/lib/hooks/use-Fcm"

function HomePageContent() {
  useLineCallback(); // Handles LINE login callback
  useGlobalErrorHandler(); // Sets up global error handling
  useFcm(); // Initialize Firebase Cloud Messaging

  const {
    activities,
    totalPages,
    currentPage,
    isLoading,
    searchParams,
    triggerSearch,
    handlePageChange
  } = useActivitySearch();

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

