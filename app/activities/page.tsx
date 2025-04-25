"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { ActivityListSkeleton } from "@/components/activity/ActivityListSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMyActivities } from "@/lib/hooks/useMyActivities";
import { isFutureDate, isPastDate } from '@/lib/utils';

export default function ActivitiesPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { activities, isLoading, refetch } = useMyActivities();

  useEffect(() => {
    if (!authUser) {
      router.replace('/login');
    } else {
      refetch();
    }
  }, [authUser, router, refetch]);

  const handleCreateActivity = () => {
    router.push("/activities/new");
  };

  const upcomingActivities = activities.filter(activity => 
    isFutureDate(activity.dateTime)
  );
  const pastActivities = activities.filter(activity => 
    isPastDate(activity.dateTime)
  );

  const renderActivityList = (activityList: typeof activities, type: 'upcoming' | 'past') => {
    if (activityList.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activityList.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity}
            />
          ))}
        </div>
      );
    } else {
      const message = type === 'upcoming' ? "您目前沒有進行中的活動" : "您還沒有歷史活動";
      return (
        <EmptyState message={message}>
          {type === 'upcoming' && (
            <Button onClick={handleCreateActivity}>建立第一個活動</Button>
          )}
        </EmptyState>
      );
    }
  };

  return (
    <div className="container max-w-5xl py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">我的活動</h1>
          <Button onClick={handleCreateActivity}>建立活動</Button>
        </div>

        {isLoading ? (
          <ActivityListSkeleton />
        ) : (
          <Tabs defaultValue="current" className="space-y-6">
            <TabsList>
              <TabsTrigger value="current">我的活動</TabsTrigger>
              <TabsTrigger value="historical">歷史活動</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {renderActivityList(upcomingActivities, 'upcoming')}
            </TabsContent>

            <TabsContent value="historical" className="space-y-4">
              {renderActivityList(pastActivities, 'past')}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
} 