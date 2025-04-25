"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { UserProfileSkeleton } from "@/components/profile/UserProfileSkeleton";
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { UserActivityTabs } from "@/components/profile/UserActivityTabs";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const userId = useMemo(() => {
    if (!params?.id) return null;
    return params.id as string;
  }, [params?.id]);

  const { user, activities, isLoading, error } = useUserProfile(userId);

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6 space-y-6">
         <Button variant="outline" onClick={() => router.back()} className="mb-4 flex items-center space-x-2 px-4 py-2" disabled>
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
        <UserProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl py-6">
         <Button variant="outline" onClick={() => router.back()} className="mb-4 flex items-center space-x-2 px-4 py-2">
           <ArrowLeft className="h-4 w-4" />
           <span>返回</span>
         </Button>
        <EmptyState
          title="發生錯誤"
          message={error}
        >
            <Button onClick={() => router.back()} className="mt-4">返回上一頁</Button>
        </EmptyState>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="container max-w-5xl py-6">
         <Button variant="outline" onClick={() => router.back()} className="mb-4 flex items-center space-x-2 px-4 py-2">
           <ArrowLeft className="h-4 w-4" />
           <span>返回</span>
         </Button>
         <EmptyState title="查無使用者" message="找不到您想查看的使用者資訊。">
            <Button onClick={() => router.back()} className="mt-4">返回上一頁</Button>
         </EmptyState>
       </div>
    )
  }

  const isCurrentUser = currentUser?.id === user.id;

  return (
    <div className="container max-w-5xl py-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 flex items-center space-x-2 px-4 py-2">
        <ArrowLeft className="h-4 w-4" />
        <span>返回</span>
      </Button>

      <div className="space-y-6">
        <UserProfileCard 
          user={user} 
          isCurrentUser={isCurrentUser} 
        />

        <UserActivityTabs activities={activities} />
      </div>
    </div>
  );
} 