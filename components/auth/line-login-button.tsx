"use client"

import { Button } from "@/components/ui/button"
import { lineConfig } from "@/lib/line-config"
import { toast } from 'react-toastify'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export function LineLoginButton() {
  const handleLineLogin = async () => {
    try {
      const authUrlBase = API_BASE_URL.replace('/api', '');
      window.location.href = `${authUrlBase}/oauth2/authorization/line`;
    } catch (error) {
      console.error('LINE login initiation failed:', error)
      toast.error('登入失敗，請稍後再試')
    }
  }

  if (!lineConfig.channelId && !lineConfig.isTestMode) {
    console.error("LINE Channel ID not configured.")
    return (
      <Button 
        disabled
        className="w-full bg-[#00B900] hover:bg-[#00A000] text-white cursor-not-allowed opacity-50"
        title="LINE Channel ID 未設定"
      >
        請先設定 LINE Channel ID
      </Button>
    )
  }

  return (
    <Button
      onClick={handleLineLogin}
      className="w-full bg-[#00B900] hover:bg-[#009900] text-white"
    >
      使用 LINE 登入
    </Button>
  )
}