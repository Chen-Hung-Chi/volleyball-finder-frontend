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
import { faVolleyball, faHandshake } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const Logo = memo(() => (
  <Link href="/" className="flex items-center gap-2 font-bold text-xl">
    <FontAwesomeIcon icon={faVolleyball} className="h-6 w-6" />
    <span>排球找隊友</span>
  </Link>
))

const ThemeToggle = memo(() => {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="切換深色/淺色模式"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="h-5 w-5 hidden dark:block" />
    </Button>
  )
})

const LoginButton = memo(() => {
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
})

const SponsorButton = () => (
  <Link href="/sponsors">
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-muted"
      aria-label="贊助商頁面"
    >
      <FontAwesomeIcon icon={faHandshake} className="h-5 w-5 text-muted-foreground" />
    </Button>
  </Link>
)

export function Header() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <header className="border-b">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-6 w-24 animate-pulse bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-10 h-10 animate-pulse bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <SponsorButton />
              <NotificationList />
              <UserMenu />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  )
}