import { Skeleton } from "@/components/ui/skeleton"

export function ActivityListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="items-center p-4 border-t flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-9 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
} 