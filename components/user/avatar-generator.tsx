"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dice5 } from "lucide-react"

type AvatarGeneratorProps = {
  value: string
  onChange: (value: string) => void
}

export function AvatarGenerator({ value, onChange }: AvatarGeneratorProps) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000))

  // 使用 useEffect 處理初始化頭像
  useEffect(() => {
    if (!value) {
      const initialAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
      onChange(initialAvatarUrl)
    }
  }, [value, seed, onChange])

  const generateNewAvatar = () => {
    const newSeed = Math.floor(Math.random() * 1000)
    setSeed(newSeed)
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`
    onChange(newAvatarUrl)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={value} alt="Avatar" />
        <AvatarFallback>頭像</AvatarFallback>
      </Avatar>
      <Button 
        variant="outline" 
        size="sm"
        onClick={generateNewAvatar}
        className="flex items-center gap-2"
      >
        <Dice5 className="h-4 w-4" />
        重新生成
      </Button>
    </div>
  )
} 