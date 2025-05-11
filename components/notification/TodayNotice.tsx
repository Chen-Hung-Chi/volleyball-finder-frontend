"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import dayjs from "dayjs"
import { Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const STORAGE_KEY = "vf_notice_dismissed_date"

export function TodayNotice() {
  const [open, setOpen] = useState(false)
  const [dontShow, setDontShow] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const today = dayjs().format("YYYY-MM-DD")
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== today) setOpen(true)
  }, [])

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem(STORAGE_KEY, dayjs().format("YYYY-MM-DD"))
    }
    setOpen(false)
  }

  const handleRegister = () => {
    handleClose()
    router.push("/login")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md animate-in zoom-in-90 fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Rocket className="h-5 w-5 text-primary" />
            排球找隊友 beta 測試中！
          </DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          🎉 歡迎使用剛上線的網站！<br />
          快來報名活動、建立自己的場次，一起享受排球樂趣！
        </p>

        <div className="mt-4 flex items-center space-x-2">
          <Checkbox
            id="dont-show"
            checked={dontShow}
            onCheckedChange={(v) => setDontShow(!!v)}
          />
          <label htmlFor="dont-show" className="text-sm select-none">
            今天不要再顯示
          </label>
        </div>

        {!user && (
          <Button className="mt-4 w-full" onClick={handleRegister}>
            馬上註冊去
          </Button>
        )}

        <Button variant="secondary" className="mt-2 w-full" onClick={handleClose}>
          知道了
        </Button>
      </DialogContent>
    </Dialog>
  )
}