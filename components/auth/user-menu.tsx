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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "@/lib/auth-context"
import { toast } from 'react-toastify'

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const menuItems = [
    { label: "我的資訊", path: "/profile" },
    { label: "我的活動", path: "/activities" },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("登出成功")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("登出失敗")
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm font-semibold truncate max-w-[180px]">
          {user.nickname || "使用者"}
        </div>
        <DropdownMenuSeparator />
        {menuItems.map(({ label, path }) => (
          <DropdownMenuItem key={path} onClick={() => router.push(path)}>
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}