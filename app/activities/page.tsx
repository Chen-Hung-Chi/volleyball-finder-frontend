"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { ActivityListSkeleton } from "@/components/activity/ActivityListSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMyActivities } from "@/lib/hooks/useMyActivities";
import { isFutureDate, isPastDate } from "@/lib/utils";

export default function ActivitiesPage() {
  const router = useRouter();

  /** auth context：多拿一個 loading 旗標，避免尚未驗證就強制跳轉 */
  const { user: authUser, loading: authLoading } = useAuth();

  /** 取得自己的活動清單 hook */
  const { activities, isLoading: activitiesLoading, refetch } = useMyActivities();

  /** 驗證流程與資料重新請求 */
  useEffect(() => {
    // 還在驗證：什麼都不做，保持原畫面
    if (authLoading) return;

    // 驗證結束但沒有登入 → 導向 /login
    if (!authUser) {
      router.replace("/login");
    } else {
      // 已登入 → 抓活動清單
      refetch();
    }
  }, [authLoading, authUser, refetch, router]);

  /** 快取 + 記憶化，避免每次 render 重算 */
  const upcomingActivities = useMemo(
    () => activities.filter((a) => isFutureDate(a.dateTime)),
    [activities]
  );
  const pastActivities = useMemo(
    () => activities.filter((a) => isPastDate(a.dateTime)),
    [activities]
  );

  /** 建立活動按鈕 handler */
  const handleCreateActivity = () => router.push("/activities/new");

  /** 共用的 list renderer */
  const renderActivityList = (
    list: typeof activities,
    type: "upcoming" | "past"
  ) => {
    if (list.length) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      );
    }

    const msg =
      type === "upcoming" ? "您目前沒有進行中的活動" : "您還沒有歷史活動";

    return (
      <EmptyState message={msg}>
        {type === "upcoming" && (
          <Button onClick={handleCreateActivity}>建立第一個活動</Button>
        )}
      </EmptyState>
    );
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="container max-w-5xl py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">我的活動</h1>
          <Button onClick={handleCreateActivity}>建立活動</Button>
        </div>

        {/* 還在驗證或活動資料載入中 → 骨架畫面 */}
        {authLoading || activitiesLoading ? (
          <ActivityListSkeleton />
        ) : (
          <Tabs defaultValue="current" className="space-y-6">
            <TabsList>
              <TabsTrigger value="current">我的活動</TabsTrigger>
              <TabsTrigger value="historical">歷史活動</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {renderActivityList(upcomingActivities, "upcoming")}
            </TabsContent>

            <TabsContent value="historical" className="space-y-4">
              {renderActivityList(pastActivities, "past")}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}