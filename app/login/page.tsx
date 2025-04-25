"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineLoginButton } from "@/components/auth/line-login-button"

export default function LoginPage() {
  return (
    <main className="container max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登入</CardTitle>
          <CardDescription>
            使用 LINE 帳號登入排球活動系統
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineLoginButton />
        </CardContent>
      </Card>
    </main>
  )
} 