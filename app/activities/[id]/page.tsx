"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import { ActivityWithParticipants } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { apiService, CaptainViewParticipantDetails } from "@/lib/apiService"
import { Calendar, MapPin, Users, ArrowLeft, DollarSign, Star, ShieldCheck } from "lucide-react"
import { ParticipantList } from "@/components/activity/ParticipantList"
import Link from "next/link"
import { cn } from '@/lib/utils'
import dayjs from "dayjs"
import { useActivityDetails } from '@/lib/hooks/useActivityDetails'
import { handleApiError } from '@/lib/error'
import { AddToGoogleCalendarButton } from '@/components/activity/AddToGoogleCalendarButton'
import { Copy, Check } from "lucide-react";

export default function ActivityDetail() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [activity, setActivity] = useState<ActivityWithParticipants | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [participantDetailsForCaptainView, setParticipantDetailsForCaptainView] = useState<Map<string, CaptainViewParticipantDetails> | null>(null);

  const activityId = useMemo(() => {
    if (!params?.id) return null
    return params.id as string
  }, [params?.id])

  const {
    isParticipant,
    isCreator,
    isPastActivity,
    netTypeLabel,
    status,
    isFullWithWaitingList,
    locationString,
    creatorNickname
  } = useActivityDetails(activity, user)

  const fetchActivity = useCallback(async () => {
    if (!activityId) {
      toast.error('活動 ID 無效')
      router.push('/activities')
      return
    }
    try {
      setIsLoading(true)
      const data = await apiService.getActivityParticipants(activityId)
      setActivity(data)
      setParticipantDetailsForCaptainView(null);
    } catch (error: any) {
      handleApiError(error, router)
      router.push('/activities')
    } finally {
      setIsLoading(false)
    }
  }, [activityId, router])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  useEffect(() => {
    const fetchDetailsForCaptain = async () => {
      if (activity && user && activity.id && String(activity.captain?.id) === String(user.id) && activity.participants.length > 0) {
        setIsLoading(true);
        try {
          const participantUserIds = activity.participants.map(p => String(p.userId));
          const resultsArray = await apiService.getActivityParticipantDetailsForCaptain(activity.id, participantUserIds);

          const newDetailsMap = new Map<string, CaptainViewParticipantDetails>();
          resultsArray.forEach(detail => {
            if (detail && detail.id) { // Ensure detail and userId are valid
              newDetailsMap.set(String(detail.id), detail);
            }
          });
          setParticipantDetailsForCaptainView(newDetailsMap);
        } catch (error) {
          console.error("Error fetching extended participant details for captain:", error);
          toast.error("無法載入隊長專用參與者資訊");
          setParticipantDetailsForCaptainView(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear details if not captain, no activity, or no participants
        setParticipantDetailsForCaptainView(null);
      }
    };

    if (activity && user) {
      fetchDetailsForCaptain();
    }
  }, [activity, user]);

  const handleJoin = useCallback(async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!activityId || !activity) {
      toast.error('活動資料無效')
      return
    }

    const currentActivityDetails = {
      title: activity.title,
      description: activity.description,
      location: locationString,
      startTime: activity.dateTime,
      durationMinutes: activity.duration
    }

    try {
      setIsJoining(true)
      await apiService.joinActivity(activityId, { position: user.position || 'NONE' })
      await fetchActivity()

      toast.success(
        ({ closeToast }) => (
          <div className="flex flex-col items-start space-y-2">
            <span>報名成功！</span>
            <AddToGoogleCalendarButton
              title={currentActivityDetails.title}
              description={currentActivityDetails.description}
              location={currentActivityDetails.location}
              startTime={currentActivityDetails.startTime}
              durationMinutes={currentActivityDetails.durationMinutes}
            />
          </div>
        ),
        { autoClose: 5000 }
      )
    } catch (error: any) {
      handleApiError(error, router)
    } finally {
      setIsJoining(false)
    }
  }, [user, activityId, router, fetchActivity, activity, locationString])

  const handleLeave = useCallback(async () => {
    if (!user || !activityId) return

    try {
      setIsLeaving(true)
      await apiService.leaveActivity(activityId)
      toast.success("已取消報名")
      await fetchActivity()
    } catch (error: any) {
      handleApiError(error, router)
    } finally {
      setIsLeaving(false)
    }
  }, [user, activityId, router, fetchActivity])

  const formatQuota = (quota: number | undefined, gender: 'male' | 'female'): React.ReactNode => {
    if (quota === undefined) return "未設定"
    if (quota === -1) {
      return (
        <span className="text-red-600 font-medium">
          {gender === 'male' ? "限制男生" : "限制女生"}
        </span>
      )
    }
    if (quota === 0) return gender === 'male' ? "不限男生" : "不限女生"
    return `${gender === 'male' ? '男' : '女'}生上限 ${quota} 人`
  }

  const handleCopy = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      })
      .catch(() => toast.error("複製失敗，請手動複製"))
  }

  const maleQuotaDisplay = useMemo(() => formatQuota(activity?.maleQuota, 'male'), [activity?.maleQuota])
  const femaleQuotaDisplay = useMemo(() => formatQuota(activity?.femaleQuota, 'female'), [activity?.femaleQuota])

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
      <div className="container max-w-5xl py-6 text-center text-gray-500">
        活動不存在或已被刪除
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-6">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-4 flex items-center space-x-2 px-4 py-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>返回</span>
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center">
                  {activity.title}
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2"
                    title="複製活動連結"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </CardTitle>

                <CardDescription>
                  由{' '}
                  <Link
                    href={`/profile/${activity.createdBy}`}
                    className="hover:underline"
                  >
                    {creatorNickname}
                  </Link>{' '}
                  建立
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {user && isCreator && <Badge variant="secondary">建立者</Badge>}

                {!isCreator && (
                  <Badge variant={status.variant} className={cn(status.className)}>
                    {status.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {activity.requireVerification && (
              <div className="mt-1 flex items-center text-blue-600 font-semibold">
                <ShieldCheck className="h-4 w-4 mr-1" />
                <span>需要實名制報名</span>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {activity.dateTime
                      ? dayjs(activity.dateTime).format('YYYY/MM/DD HH:mm')
                      : '未設定時間'}
                    {activity.duration && ` (${activity.duration} 分鐘)`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{locationString}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {activity.participants.length} / {activity.maxParticipants} 人
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{activity.amount} 元 / 人</span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium mb-2">活動設定</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>網別：{netTypeLabel}</span>
                </div>

                {activity.femalePriority && (
                  <div className="flex items-center gap-2 text-pink-600">
                    <Star className="h-4 w-4" />
                    <span>女生優先報名</span>
                  </div>
                )}

                <div className="flex items-center gap-2 md:col-span-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    性別名額：{maleQuotaDisplay} / {femaleQuotaDisplay}
                  </span>
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
              <div className="flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                {/* 隊長可多看到編輯活動 */}
                {isCreator && (
                  <Button onClick={() => router.push(`/activities/${activity.id}/edit`)}>
                    編輯活動
                  </Button>
                )}

                {/* 已參加者可看到取消報名、加到 Google 行事曆 */}
                {!isPastActivity && isParticipant && (
                  <>
                    <AddToGoogleCalendarButton
                      title={activity.title}
                      description={activity.description}
                      location={locationString}
                      startTime={activity.dateTime}
                      durationMinutes={activity.duration}
                    />
                    <Button onClick={handleLeave} disabled={isLeaving} variant="destructive">
                      {isLeaving ? "取消報名中..." : "取消報名"}
                    </Button>
                  </>
                )}

                {/* 沒參加的人可看到報名（不論是不是隊長，只要沒參加都可報名或候補） */}
                {!isPastActivity && !isParticipant && !isFullWithWaitingList && (
                  <Button onClick={handleJoin} disabled={isJoining}>
                    {isJoining
                      ? "報名中..."
                      : activity.participants.length >= activity.maxParticipants
                        ? "我要候補"
                        : "我要報名"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {activity.participants.length > 0 && (
          <>
            <ParticipantList
              participants={activity.participants.slice(0, activity.maxParticipants)}
              activityCaptainId={activity.captain?.id ?? ""}
              currentUserId={user?.id ?? ""}
              activityId={activity.id}
              participantDetailsForCaptainView={participantDetailsForCaptainView}
              requireVerification={activity.requireVerification}
            />
            {activity.participants.length > activity.maxParticipants && (
              <ParticipantList
                participants={activity.participants.slice(activity.maxParticipants)}
                isWaiting={true}
                activityCaptainId={activity.captain?.id ?? ""}
                currentUserId={user?.id ?? ""}
                activityId={activity.id}
                participantDetailsForCaptainView={participantDetailsForCaptainView}
                requireVerification={activity.requireVerification}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
} 