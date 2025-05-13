"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import { useAuth } from "@/lib/auth-context"
import { apiService } from "@/lib/apiService"
import { LOCATIONS } from "@/lib/constants"
import { format } from "date-fns"
import { ActivityForm } from "@/components/activity/ActivityForm"
import { handleApiError } from "@/lib/error"
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface FormData {
  title: string
  description: string
  dateTime: Date | null
  duration: number
  location: string
  maxParticipants: number
  amount: number
  city: string
  district: string
  netType: 'MEN' | 'WOMEN' | 'MIXED'
  maleQuota: number
  femaleQuota: number
  femalePriority: boolean
}

export default function EditActivity() {
  const params = useParams()
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dateTime: null,
    duration: 60,
    location: "",
    maxParticipants: 12,
    amount: 0,
    city: "",
    district: "",
    netType: 'MIXED',
    maleQuota: 0,
    femaleQuota: 0,
    femalePriority: false
  })

  // 參考用於聚焦的元素
  const titleRef = useRef<HTMLInputElement>(null)
  const locationRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  // 載入活動資料
  useEffect(() => {
    const fetchActivity = async () => {
      if (!params?.id) {
        toast.error('活動 ID 無效')
        router.push('/activities')
        return
      }

      try {
        setIsLoading(true)
        const activityId = params.id as string
        const activity = await apiService.getActivity(activityId)

        // 檢查是否為活動建立者
        if (activity.createdBy !== authUser?.id) {
          toast.error('您沒有權限編輯此活動')
          router.push('/activities')
          return
        }

        // 設置日期和時間
        const activityDate = new Date(activity.dateTime)
        setDate(activityDate)
        setTime(format(activityDate, 'HH:mm'))

        // 找到對應的城市和地區名稱
        const city = LOCATIONS.cities.find(c => c.code === activity.city)
        const district = city?.districts.find(d => d.code === activity.district)

        setFormData({
          title: activity.title,
          description: activity.description || "",
          dateTime: activityDate,
          duration: activity.duration,
          location: activity.location,
          maxParticipants: activity.maxParticipants,
          amount: activity.amount,
          city: city?.name || "",
          district: district?.name || "",
          netType: activity.netType || 'MIXED',
          maleQuota: activity.maleQuota || 0,
          femaleQuota: activity.femaleQuota || 0,
          femalePriority: activity.femalePriority || false
        })
      } catch (error: any) {
        handleApiError(error, router)
        router.push('/activities')
      } finally {
        setIsLoading(false)
      }
    }

    if (authUser !== undefined) {
      fetchActivity()
    }
  }, [params?.id, router, authUser])

  const handleSave = async () => {
    if (!authUser || !authUser.id) {
      toast.error("請先登入")
      router.push('/login')
      return
    }

    const activityId = params.id as string
    if (!activityId) {
      toast.error("活動 ID 無效")
      return
    }

    // 驗證表單
    if (!(window as any).validateActivityForm?.()) {
      return
    }

    // 找到對應的城市和地區代碼
    const selectedCity = LOCATIONS.cities.find(c => c.name === formData.city)
    const selectedDistrict = selectedCity?.districts.find(d => d.name === formData.district)

    if (!selectedCity || !selectedDistrict) {
      toast.error("無效的城市或地區")
      return
    }

    // 準備活動數據
    const activityData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      dateTime: dayjs(formData.dateTime!).tz("Asia/Taipei").format("YYYY-MM-DDTHH:mm:ss"),
      duration: formData.duration,
      location: formData.location.trim(),
      maxParticipants: formData.maxParticipants,
      amount: formData.amount,
      city: selectedCity.code,
      district: selectedDistrict.code,
      netType: formData.netType,
      maleQuota: formData.maleQuota,
      femaleQuota: formData.femaleQuota,
      femalePriority: formData.femalePriority,
    }

    try {
      setIsSaving(true)
      const activity = await apiService.updateActivity(activityId, activityData)
      toast.success("活動已更新")
      router.push(`/activities/${activityId}`)
    } catch (error: any) {
      handleApiError(error, router)
    } finally {
      setIsSaving(false)
    }
  }

  if (!authUser) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">編輯活動</h1>
          <p className="text-center text-gray-500">請先登入以編輯活動</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.push('/login')}>
              前往登入
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">編輯活動</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 dark:text-zinc-100">編輯活動</h1>

        <ActivityForm
          formData={formData}
          setFormData={setFormData}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          titleRef={titleRef}
          locationRef={locationRef}
          amountRef={amountRef}
        />

        {/* 按鈕區域 */}
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="dark:hover:bg-primary/90"
          >
            {isSaving ? "儲存中..." : "儲存"}
          </Button>
        </div>
      </Card>
    </div>
  )
} 