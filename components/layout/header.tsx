"use client"

import Link from "next/link"
import { LogIn, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { memo } from "react"
import { useRouter } from "next/navigation"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth-context"
import { NotificationList } from "@/components/notification/NotificationList"
import { faVolleyball } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


// 將 Logo 組件分離並記憶化
const Logo = memo(function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
      <FontAwesomeIcon icon={faVolleyball} className="h-6 w-6" />
      <span>排球找隊友</span>
    </Link>
  )
});

// 將主題切換按鈕組件分離並記憶化
const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative overflow-hidden transition-all duration-300 hover:scale-110"
      aria-label="切換深色/淺色模式"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
});

// 將登入按鈕組件分離並記憶化
const LoginButton = memo(function LoginButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => router.push("/login")}
    >
      <LogIn className="h-4 w-4" />
      <span>登入</span>
    </Button>
  )
});

// 將載入中的header組件分離
function LoadingHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              {/* 載入狀態的圖標佔位符 */}
              {/* 注意：這裡的佔位符仍然是 div，不是 Font Awesome 圖標本身 */}
              <div className="h-6 w-6 animate-pulse bg-gray-200 rounded" />
              {/* 載入狀態的文字佔位符 */}
              <div className="w-24 h-6 animate-pulse bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* 載入狀態的按鈕佔位符 */}
            <div className="w-10 h-10 animate-pulse bg-gray-200 rounded" />
            <div className="w-10 h-10 animate-pulse bg-gray-200 rounded" />
            <div className="w-20 h-8 animate-pulse bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </header>
  )
}

export function Header() {
  const { user, loading } = useAuth()

  // 如果正在載入，顯示載入中的 header
  if (loading) {
    return <LoadingHeader />
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-4">
            {/* 只有在用戶已登入時才顯示通知鈴鐺和用戶選單 */}
            {user ? (
              <>
                <NotificationList />
                <UserMenu />
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}