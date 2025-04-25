"use client"

import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/header'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '@/lib/auth-context'
import 'react-toastify/dist/ReactToastify.css'
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

const currentYear = new Date().getFullYear()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-4">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                © {currentYear} 排球找隊友. All rights reserved.
              </div>
            </footer>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
