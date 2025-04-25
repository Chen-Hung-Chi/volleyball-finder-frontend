"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from 'react-toastify'

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("登出成功");
    } catch (error) {
       console.error("Logout failed:", error);
       toast.error("登出失敗");
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm font-semibold">
          {user.nickname || "使用者"}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          我的資訊
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/activities')}>
          我的活動
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 