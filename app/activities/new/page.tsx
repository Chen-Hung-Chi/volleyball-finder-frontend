"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import { useAuth } from "@/lib/auth-context"
import { apiService } from "@/lib/api"
import { LOCATIONS } from "@/lib/constants"
import { ActivityForm } from "@/components/activity/ActivityForm"

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

export default function NewActivity() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string>("12:00")
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

  const handleCreate = async () => {
    if (!authUser || !authUser.id) {
      toast.error("請先登入")
      router.push('/login')
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

    // --- Adjust quotas before sending --- 
    let finalMaleQuota = formData.maleQuota;
    let finalFemaleQuota = formData.femaleQuota;

    if (finalMaleQuota === -1) {
        finalFemaleQuota = 0; // If male is limited, female becomes unlimited
    } else if (finalFemaleQuota === -1) {
        finalMaleQuota = 0; // If female is limited, male becomes unlimited
    }
    // --- End quota adjustment --- 

    // 準備活動數據 using adjusted quotas
    const activityData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      dateTime: formData.dateTime!.toISOString(),
      duration: formData.duration,
      location: formData.location.trim(),
      maxParticipants: formData.maxParticipants,
      amount: formData.amount,
      city: selectedCity.code,
      district: selectedDistrict.code,
      netType: formData.netType,
      maleQuota: finalMaleQuota, // Use adjusted value
      femaleQuota: finalFemaleQuota, // Use adjusted value
      femalePriority: formData.femalePriority,
    }
    
    try {
      setIsSaving(true)
      const activity = await apiService.createActivity(activityData)
      toast.success("活動已建立")
      router.push(`/activities/${activity.id}`)
    } catch (error) {
      console.error('Error in handleCreate:', error)
      toast.error("建立失敗，請稍後再試")
    } finally {
      setIsSaving(false)
    }
  }

  if (!authUser) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">建立活動</h1>
          <p className="text-center text-gray-500">請先登入以建立活動</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.push('/login')}>
              前往登入
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 dark:text-zinc-100">建立活動</h1>
        
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
            onClick={handleCreate} 
            disabled={isSaving}
            className="dark:hover:bg-primary/90"
          >
            {isSaving ? "建立中..." : "建立活動"}
          </Button>
        </div>
      </Card>
    </div>
  )
} 