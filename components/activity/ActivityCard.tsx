import { Calendar, MapPin, Users, DollarSign, Info, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Activity } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NET_TYPES } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { findCityByCode, findDistrictByCode, formatTaipeiTime, cn, getActivityBadgeStatus } from "@/lib/utils"

interface ActivityCardProps {
  activity: Activity;
  isPast?: boolean;
}

export function ActivityCard({ activity, isPast = false }: ActivityCardProps) {
  const city = findCityByCode(activity.city);
  const district = findDistrictByCode(activity.city, activity.district);
  const location = `${city?.name || ''} ${district?.name || ''} · ${activity.location}`;

  const status = getActivityBadgeStatus(activity);

  const netTypeLabel = NET_TYPES.find(type => type.value === activity.netType)?.label || '';

  return (
    <Link href={`/activities/${activity.id}`} className="block group h-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
      <Card className={cn(
        "overflow-hidden bg-card hover:shadow-lg transition-all duration-300 flex flex-col h-full border relative",
        "group-hover:bg-black group-hover:text-white",
        "dark:group-hover:bg-white dark:group-hover:text-black"
      )}>
        <ArrowRight className={cn(
          "absolute bottom-4 right-4 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "group-hover:text-white dark:group-hover:text-black"
        )} />
        
        <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0 pr-8">
              <CardTitle className="text-lg font-semibold leading-tight break-words">
              {activity.title}
            </CardTitle>
              <div className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground flex-wrap",
                "group-hover:text-gray-300 dark:group-hover:text-gray-600"
              )}>
              <span>{netTypeLabel}</span>
              {activity.femalePriority && (
                <>
                  <span className="text-xs">•</span>
                    <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 text-pink-500 group-hover:text-pink-500 dark:group-hover:text-pink-500 cursor-default">
                          <span>女生優先</span>
                          <Info className="h-3 w-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>當女生名額未滿時，將優先保留給女生報名。</p>
                        <p>男生報名將進入候補名單，待女生名額額滿後依序遞補。</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
          <Badge variant={status.variant} className={cn("shrink-0 whitespace-nowrap", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
        <CardContent className="p-4 pt-3 flex-grow">
          <div className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground",
            "group-hover:text-gray-300 dark:group-hover:text-gray-600"
          )}>
            <div className="flex items-center col-span-2">
              <Calendar className="w-4 h-4 mr-2 shrink-0" />
              <div className="min-w-0">
              <span>{formatTaipeiTime(activity.dateTime)}</span>
                <span className="ml-1.5 text-xs">({activity.duration} 分鐘)</span>
              </div>
            </div>
            <div className="flex items-start col-span-2">
              <MapPin className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span className="min-w-0 break-words">
              {location}
            </span>
          </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 shrink-0" />
              <span>
                {activity.currentParticipants || 0} / {activity.maxParticipants} 人
            </span>
          </div>
            <div className="flex items-center">
              <span className="mr-1">♂</span><span>{activity.maleCount || 0}</span>
              <span className="mx-1">/</span>
              <span className="mr-1">♀</span><span>{activity.femaleCount || 0}</span>
            </div>
            <div className="flex items-center col-span-2">
              <DollarSign className="w-4 h-4 mr-2 shrink-0" />
              <span>
                {activity.amount > 0 ? `${activity.amount} 元` : '免費'}
            </span>
          </div>
        </div>
      </CardContent>
      </Card>
        </Link>
  );
} 