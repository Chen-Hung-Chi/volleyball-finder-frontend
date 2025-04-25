import { Activity, ActivityListProps } from "@/lib/types/activity"
import { ActivityCard } from "./ActivityCard"

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {activities.map((activity: Activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
} 