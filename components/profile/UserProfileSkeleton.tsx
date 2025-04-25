import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" /> {/* Edit button */} 
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24" /> {/* Badge */} 
              </div>
            ))}
          </div>
          {/* Introduction Skeleton */}
          <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
          <div className="flex space-x-4 border-b">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
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
               <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
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
          </div>
      </div>
    </div>
  );
} 