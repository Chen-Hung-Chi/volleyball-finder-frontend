"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import { Activity } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

export default function UserActivitiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadActivities()
    } else {
      router.push('/login')
    }
  }, [user, router])

  const loadActivities = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userActivities = await apiService.getUserActivities(user.id)
      setActivities(userActivities)
    } catch (error) {
      console.error("載入活動失敗:", error)
      toast.error("載入活動失敗，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="text-center">載入中...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的活動</h1>
        <Button onClick={() => router.push("/activities/new")}>
          建立新活動
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card className="p-6">
          <div className="text-center text-gray-500">
            您還沒有建立任何活動
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-6 w-full">
              <h2 className="text-xl font-semibold mb-2">{activity.title}</h2>
              <p className="text-gray-600 mb-4">{activity.description}</p>
              <div className="text-sm text-gray-500">
                <p>時間：{new Date(activity.dateTime).toLocaleString('zh-TW', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}</p>
                <p>地點：{activity.location}</p>
                <p>人數：{activity.currentParticipants}/{activity.maxParticipants}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/activities/${activity.id}`)}
                >
                  查看詳情
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/activities/${activity.id}/edit`)}
                >
                  編輯
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 