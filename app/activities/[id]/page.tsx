"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import { ActivityWithParticipants } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { POSITIONS, Position, LOCATIONS, NET_TYPES} from "@/lib/constants"
import { apiService } from "@/lib/api"
import { Calendar, MapPin, Users, ArrowLeft, DollarSign, Info, Star } from "lucide-react"
import { ParticipantList } from "@/components/activity/ParticipantList"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatTaipeiTime, cn, getActivityBadgeStatus } from '@/lib/utils'

// 取得位置標籤
const getPositionLabel = (position: Position | undefined) => {
  if (!position) return "未設定";
  return POSITIONS.find(p => p.value === position)?.label || "未設定";
}

export default function ActivityDetail() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [activity, setActivity] = useState<ActivityWithParticipants | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const activityId = useMemo(() => {
    if (!params?.id) return null;
    return params.id as string;
  }, [params?.id]);

  const fetchActivity = useCallback(async () => {
    if (!activityId) {
      toast.error('活動 ID 無效');
      router.push('/activities');
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiService.getActivityParticipants(activityId);
      setActivity(data);
    } catch (err: any) {
      console.error('Error fetching activity:', err);
      if (err?.response?.status === 403) {
        toast.error('您沒有權限查看此活動');
      } else if (err?.response?.status === 404) {
        toast.error('找不到此活動');
      } else {
        toast.error('載入活動資訊失敗，請稍後再試');
      }
      router.push('/activities');
    } finally {
      setIsLoading(false);
    }
  }, [activityId, router]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleJoin = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!activityId) {
      toast.error('活動 ID 無效');
      return;
    }

    try {
      setIsJoining(true);
      await apiService.joinActivity(activityId, {
        position: user.position || 'NONE'
      });
      toast.success('報名成功！');
      await fetchActivity();
    } catch (error: any) {
      // Check for the specific 30-minute wait error first
      if (error.response?.data?.code === 'ACTIVITY_WAIT_30M') {
        toast.warning(error.response.data.message || '退出後需等待 30 分鐘才能重新加入');
        // Return here to prevent further error logging/handling for this specific case
        return; 
      }

      // Log other errors
      console.error('Join activity error:', error); 

      // Handle other specific error codes
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        toast.error('請先完成個人資料設定');
        router.push('/profile');
      } else if (error.response?.data?.code === 'ACTIVITY_FULL') {
        toast.error('活動已額滿');
      } else if (error.response?.data?.code === 'ACTIVITY_ALREADY_JOINED') {
        toast.error('您已經報名過此活動');
      } else {
        // Generic fallback toast for other errors
        toast.error(error.response?.data?.message || '報名失敗，請稍後再試');
      }
    } finally {
      setIsJoining(false);
    }
  }, [user, activityId, router, fetchActivity]);

  const handleLeave = useCallback(async () => {
    if (!user || !activityId) return;
    
    try {
      setIsLeaving(true);
      await apiService.leaveActivity(activityId);
      toast.success("已取消報名");
      await fetchActivity();
    } catch (error: any) {
      console.error('Leave activity error:', error);
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        toast.error('請先完成個人資料設定');
        router.push('/profile');
      } else if (error.response?.data?.code === 'ACTIVITY_NOT_JOINED') {
        toast.error('您尚未報名此活動');
      } else if (error.response?.data?.code === 'ACTIVITY_LEAVED') {
        toast.error('您已經取消報名此活動');
      } else {
        toast.error(error.response?.data?.message || '取消報名失敗，請稍後再試');
      }
    } finally {
      setIsLeaving(false);
    }
  }, [user, activityId, router, fetchActivity]);

  // Check if the current user is already a participant
  const isParticipant = useMemo(() => {
    if (!user || !activity?.participants) return false;
    // Use participant.userId from the DTO
    return activity.participants.some(participant => participant.userId === user.id);
  }, [user, activity?.participants]);

  // Check if the current user is the creator/captain
  const isCreator = useMemo(() => {
    // Assuming captain is part of the main activity data or fetched separately
    // If captain info is needed, ensure it's fetched and available in `activity` state
    return user?.id === activity?.createdBy;
  }, [user, activity?.createdBy]);

  // Add memoized value to check if activity is in the past
  const isPastActivity = useMemo(() => {
    if (!activity?.dateTime) return false; // Default to false if no date
    // Compare activity dateTime with current time
    return new Date(activity.dateTime) < new Date(); 
  }, [activity?.dateTime]);

  // Use the utility function to get status directly
  const status = getActivityBadgeStatus(activity);

  // Determine if no more participants can join (including waiting list)
  const isFullWithWaitingList = useMemo(() => {
    if (!activity) return false;
    return activity.participants.length >= (activity.maxParticipants + 10);
  }, [activity]);

  // Helper function to format quota text
  const formatQuota = (quota: number | undefined, gender: 'male' | 'female'): React.ReactNode => {
    if (quota === undefined) return "未設定";
    // If quota is -1, return JSX with red text
    if (quota === -1) {
      return (
        <span className="text-red-600 font-medium">
          {gender === 'male' ? "限制男生" : "限制女生"}
        </span>
      );
    }
    // Otherwise, return string as before
    if (quota === 0) return gender === 'male' ? "不限男生" : "不限女生";
    return `${gender === 'male' ? '男' : '女'}生上限 ${quota} 人`;
  };

  // Helper to get net type label
  const netTypeLabel = useMemo(() => {
    return NET_TYPES.find(type => type.value === activity?.netType)?.label || '未設定';
  }, [activity?.netType]);

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="container max-w-5xl py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 flex items-center space-x-2 px-4 py-2">
        <ArrowLeft className="h-4 w-4" />
        <span>返回</span>
      </Button>
      
      {activity && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{activity.title}</CardTitle>
                  <CardDescription>
                    由 <Link href={`/profile/${activity.createdBy}`} className="hover:underline">{activity.captain?.nickname}</Link> 建立
                  </CardDescription>
                </div>
                {user && (
                  <div className="flex items-center gap-2">
                    {isCreator ? (
                      <Badge variant="secondary">你是建立者</Badge>
                    ) : (
                      <Badge variant={status.variant} className={cn(status.className)}>
                        {status.label}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {activity.dateTime ? formatTaipeiTime(activity.dateTime) : '未設定時間'}
                    {activity.duration && ` (${activity.duration} 分鐘)`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{LOCATIONS.cities.find(city => city.code === activity.city)?.name} {LOCATIONS.cities.find(city => city.code === activity.city)?.districts.find(d => d.code === activity.district)?.name} - {activity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {activity.participants.length} / {activity.maxParticipants} 人
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {activity.amount} 元 / 人
                  </span>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium mb-2">活動設定</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>網別：{netTypeLabel}</span>
                    </div>
                    
                    {/* Female Priority */}
                    {activity.femalePriority && (
                         <div className="flex items-center gap-2 text-pink-600">
                             <Star className="h-4 w-4" /> 
                            <span>女生優先報名</span>
                             <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger className="ml-1 cursor-default">
                                    <Info className="h-3 w-3 text-muted-foreground" /> 
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>• 當女生名額未滿時，將優先保留給女生報名</p>
                                    <p>• 男生報名將進入候補名單</p>
                                    <p>• 待女生名額額滿後，男生才能依序遞補</p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                         </div>
                    )}

                    {/* Gender Quotas - Remove tooltip from here */}
                    <div className="flex items-center gap-2 md:col-span-2">
                        <Users className="h-4 w-4 text-muted-foreground" /> {/* Icon for quotas */} 
                        <span>性別名額：{formatQuota(activity.maleQuota, 'male')} / {formatQuota(activity.femaleQuota, 'female')}</span>
                    </div>
                </div>
              </div>

              {activity.description && (
                <div className="border-t pt-6 space-y-2">
                  <h3 className="font-medium">活動說明</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>
              )}

              {user && (
                <div className="flex justify-end mt-4">
                  {isCreator ? (
                    <Button onClick={() => router.push(`/activities/${activity.id}/edit`)}>
                      編輯活動
                    </Button>
                  ) : !isPastActivity && (
                    isParticipant ? (
                      <Button onClick={handleLeave} disabled={isLeaving} variant="destructive">
                        {isLeaving ? "取消報名中..." : "取消報名"}
                      </Button>
                    ) : !isFullWithWaitingList && (
                      <Button onClick={handleJoin} disabled={isJoining}>
                        {isJoining ? "報名中..." : 
                          activity.participants.length >= activity.maxParticipants ? 
                          "我要候補" : "我要報名"}
                      </Button>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {activity && activity.participants.length > 0 && (
            <>
              <ParticipantList 
                participants={activity.participants.slice(0, activity.maxParticipants)} 
              />
              {activity.participants.length > activity.maxParticipants && (
                <ParticipantList 
                  participants={activity.participants.slice(activity.maxParticipants)} 
                  isWaiting={true}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
} 