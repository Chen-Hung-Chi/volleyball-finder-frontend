import { Activity } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActivityCard } from '@/components/activity/ActivityCard';

interface UserActivityTabsProps {
  activities: Activity[];
}

export function UserActivityTabs({ activities }: UserActivityTabsProps) {
  const now = new Date();
  const upcomingActivities = activities.filter(activity => new Date(activity.dateTime) >= now);
  const pastActivities = activities.filter(activity => new Date(activity.dateTime) < now);
  const upcomingCount = upcomingActivities.length;
  const pastCount = pastActivities.length;

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming">
          即將開始 <span className="ml-1.5 text-xs text-muted-foreground">({upcomingCount})</span>
        </TabsTrigger>
        <TabsTrigger value="past">
          已經結束 <span className="ml-1.5 text-xs text-muted-foreground">({pastCount})</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        {upcomingCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {upcomingActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} requireVerification={activity.requireVerification} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="尚無即將開始的活動"
            message="目前沒有任何已安排的活動。"
          />
        )}
      </TabsContent>
      <TabsContent value="past">
        {pastCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {pastActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} isPast={true} requireVerification={activity.requireVerification} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="尚無已結束的活動"
            message="目前沒有任何已完成的活動。"
          />
        )}
      </TabsContent>
    </Tabs>
  );
} 