"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelectorProps } from "@/lib/types/ui" // Import props type

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // 生成 100 個不同的種子值
  const seeds = Array.from({ length: 100 }, (_, i) => i + 1)

  useEffect(() => {
    setMounted(true)
    // 如果有現有的值，從 URL 中提取種子值
    if (value) {
      const match = value.match(/seed=(\d+)/)
      if (match) {
        setSelectedSeed(parseInt(match[1]))
      }
    } else {
      // 如果沒有值，設置默認種子值
      setSelectedSeed(1)
      onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=1`)
    }
  }, [value, onChange])

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>頭像</AvatarFallback>
          </Avatar>
        </div>
        <div className="h-[300px] rounded-md border p-4">
          <div className="animate-pulse bg-gray-200 h-full rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={selectedSeed ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSeed}` : undefined} 
            alt="Avatar" 
          />
          <AvatarFallback>頭像</AvatarFallback>
        </Avatar>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="grid grid-cols-3 gap-4">
          {seeds.map((seed) => (
            <div
              key={seed}
              className={cn(
                "cursor-pointer rounded-lg border p-2 transition-colors hover:bg-accent",
                selectedSeed === seed && "border-primary bg-accent"
              )}
              onClick={() => {
                setSelectedSeed(seed)
                onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`)
              }}
            >
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                  alt={`Avatar ${seed}`} 
                />
                <AvatarFallback>頭像</AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 