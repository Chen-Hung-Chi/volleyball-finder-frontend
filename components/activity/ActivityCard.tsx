"use client"
import { useMemo } from "react"
import Link from "next/link"
import dayjs from "dayjs"
import { Calendar, MapPin, Users, DollarSign, Info, ArrowRight, ShieldCheck } from "lucide-react"

import { Activity } from "@/lib/types"
import { NET_TYPES } from "@/lib/constants"
import { findCityByCode, findDistrictByCode, getActivityBadgeStatus, cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityCardProps {
  activity: Activity
  isPast?: boolean
  requireVerification?: boolean
}

export function ActivityCard({ activity, isPast, requireVerification }: ActivityCardProps) {
  /** ======== 衍生資料 memo ======== */
  const {
    locationString,
    netTypeLabel,
    status,
    formattedTime
  } = useMemo(() => {
    // 位置
    const city = findCityByCode(activity.city)
    const district = findDistrictByCode(activity.city, activity.district)
    const location = `${city?.name || ""} ${district?.name || ""} · ${activity.location}`

    // 網別
    const netLabel = NET_TYPES.find(t => t.value === activity.netType)?.label || ""

    // 活動狀態 Badge
    const badgeInfo = getActivityBadgeStatus(activity)

    // 直接用 dayjs 格式化 → YYYY/MM/DD HH:mm
    const timeText = dayjs(activity.dateTime).format("YYYY/MM/DD HH:mm")

    return {
      locationString: location,
      netTypeLabel: netLabel,
      status: badgeInfo,
      formattedTime: timeText
    }
  }, [activity])

  /** ======== 共用 class ======== */
  const hoverTxt = "group-hover:text-gray-300 dark:group-hover:text-gray-600"

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block group h-full rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border bg-card transition-all duration-300 hover:shadow-lg",
          "group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black"
        )}
      >
        {/* → icon */}
        <ArrowRight
          className={cn(
            "absolute bottom-4 right-4 h-5 w-5 text-muted-foreground opacity-0 transition-opacity duration-300",
            "group-hover:opacity-100 group-hover:text-white dark:group-hover:text-black"
          )}
        />

        {/* Header */}
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <CardTitle className="break-words text-lg font-semibold leading-tight">
                  {activity.title}
                </CardTitle>
              </div>
              <div className={cn(
                "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
                hoverTxt
              )}>
                {/* 實名制放最前面 */}
                {requireVerification && (
                  <>
                    <span className="flex items-center gap-1 text-blue-500">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="font-small">實名制</span>
                    </span>
                    {/* 若後面還有內容才顯示 | */}
                    {(netTypeLabel || activity.femalePriority) && <span className="text-xs">|</span>}
                  </>
                )}
                {/* 網別 */}
                {netTypeLabel && (
                  <span
                    className={
                      netTypeLabel === "男網"
                        ? "text-blue-500"
                        : netTypeLabel === "女網"
                          ? "text-pink-500"
                          : netTypeLabel === "混網"
                            ? "text-purple-500"
                            : ""
                    }
                  >
                    {netTypeLabel}
                  </span>
                )}
                {/* 女生優先 */}
                {activity.femalePriority && (
                  <>
                    {netTypeLabel && <span className="text-xs">|</span>}
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger
                          asChild
                          onClick={e => e.stopPropagation()}
                          className="cursor-default"
                        >
                          <span className="flex items-center gap-1 text-pink-500">
                            女生優先
                            <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>女生名額未滿時將優先保留給女生報名。</p>
                          <p>男生將進入候補，待女生名額額滿後依序遞補。</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
            {/* 狀態 Badge */}
            <Badge
              variant={status.variant}
              className={cn("shrink-0 whitespace-nowrap", status.className)}
            >
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        {/* Content */}
        <CardContent className="flex-grow p-4 pt-3">
          <div className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground",
            hoverTxt
          )}>
            {/* 時間 */}
            <div className="col-span-2 flex items-center">
              <Calendar className="mr-2 h-4 w-4 shrink-0" />
              <span>{formattedTime}</span>
              <span className="ml-1.5 text-xs">({activity.duration} 分)</span>
            </div>

            {/* 地點 */}
            <div className="col-span-2 flex items-start">
              <MapPin className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
              <span className="break-words min-w-0">{locationString}</span>
            </div>

            {/* 人數總量 */}
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 shrink-0" />
              <span>{activity.currentParticipants} / {activity.maxParticipants} 人</span>
            </div>

            {/* 男女比例 */}
            <div className="flex items-center">
              <span className="mr-1">♂</span><span>{activity.maleCount}</span>
              <span className="mx-1">/</span>
              <span className="mr-1">♀</span><span>{activity.femaleCount}</span>
            </div>

            {/* 費用 */}
            <div className="col-span-2 flex items-center">
              <DollarSign className="mr-2 h-4 w-4 shrink-0" />
              <span>{activity.amount > 0 ? `${activity.amount} 元` : "免費"}</span>
            </div>

          </div>
        </CardContent>
      </Card>
    </Link>
  )
}