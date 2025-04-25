import { useRouter } from "next/navigation"
import { Calendar, MapPin, Users, DollarSign, Info } from "lucide-react"
import { Activity } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { NET_TYPES } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { findCityByCode, findDistrictByCode, formatTaipeiTime, cn, getActivityBadgeStatus } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ActivityCardProps {
  activity: Activity;
  isPast?: boolean;
}

export function ActivityCard({ activity, isPast = false }: ActivityCardProps) {
  const router = useRouter();
  
  const city = findCityByCode(activity.city);
  const district = findDistrictByCode(activity.city, activity.district);
  const location = `${city?.name || ''} ${district?.name || ''} · ${activity.location}`;

  const status = getActivityBadgeStatus(activity);

  const netTypeLabel = NET_TYPES.find(type => type.value === activity.netType)?.label || '';

  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow transition-all duration-300 flex flex-col h-full">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <CardTitle className="text-lg font-bold leading-tight break-words">
              {activity.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span>{netTypeLabel}</span>
              {activity.femalePriority && (
                <>
                  <span className="text-xs">•</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-pink-500 cursor-default">
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
      <CardContent className="p-5 pt-0 flex-grow">
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2.5 shrink-0" />
            <div className="text-sm">
              <span>{formatTaipeiTime(activity.dateTime)}</span>
              <span className="ml-1 text-xs">({activity.duration} 分鐘)</span>
            </div>
          </div>
          <div className="flex items-start text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2.5 shrink-0 mt-px" />
            <span className="text-sm">
              {location}
            </span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="text-sm">
              {activity.currentParticipants || 0}/{activity.maxParticipants} 人
            </span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="text-sm">
              {activity.amount} 元
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 border-t mt-auto">
        <Link href={`/activities/${activity.id}`} className="w-full">
          <Button 
            variant="outline"
            size="sm"
            className="w-full hover:bg-primary hover:text-primary-foreground"
          >
            查看詳情 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 