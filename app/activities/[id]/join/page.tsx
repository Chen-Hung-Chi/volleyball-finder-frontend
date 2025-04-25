"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { POSITIONS } from "@/lib/constants"

export default function JoinActivity() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const activityId = params?.id as string | null

  useEffect(() => {
    if (!activityId) {
      router.push("/activities")
      return
    }
  }, [activityId, router])

  const handleJoinTeam = async () => {
    if (!activityId || !user) return

    try {
      setIsLoading(true)
      await apiService.joinActivity(activityId, {
        position: user.position || POSITIONS[0].value
      })
      toast({
        title: "成功",
        description: "成功加入活動！",
      })
      router.push(`/activities/${activityId}`)
    } catch (error) {
      console.error("加入活動失敗:", error)
      toast({
        title: "錯誤",
        description: "加入活動失敗，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!activityId) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>加入活動</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>正在處理您的加入請求...</p>
          <Button onClick={handleJoinTeam} className="w-full" disabled={isLoading}>
            立即加入
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 