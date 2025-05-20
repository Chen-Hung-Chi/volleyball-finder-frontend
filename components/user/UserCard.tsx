"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { POSITIONS, LEVELS } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserCardProps } from "@/lib/types/user"

export function UserCard({
  userId,
  nickname,
  avatar,
  position,
  level,
  volleyballAge,
  isCaptain = false,
  isWaiting = false,
  gender = null,
  onClick,
  realName,
  requireVerification
}: UserCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/profile/${userId}`);
    }
  };

  const details = [
    position ? POSITIONS.find(p => p.value === position)?.label : null,
    level ? LEVELS.find(l => l.value === level)?.label : null,
    volleyballAge !== null && volleyballAge !== undefined ? `球齡 ${volleyballAge} 年` : null
  ].filter(Boolean);

  // Determine border color based on gender
  const genderBorderClass =
    gender === 'MALE' ? 'border-l-blue-500' :
      gender === 'FEMALE' ? 'border-l-pink-500' :
        'border-l-transparent';

  // Determine ring color based on gender
  const genderRingClass =
    gender === 'MALE' ? 'ring-blue-500' :
      gender === 'FEMALE' ? 'ring-pink-500' :
        'ring-transparent'; // No ring if gender is null or other

  return (
    <Card
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors",
        "border-l-4",
        genderBorderClass
      )}
      onClick={handleClick}
    >
      <Avatar className={cn(
        "h-10 w-10",
        "ring-2 ring-offset-1 ring-offset-background", // Add base ring styles
        genderRingClass // Apply conditional ring color
      )}>
        <AvatarImage src={avatar} alt={nickname} />
        <AvatarFallback>{nickname?.[0] || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{nickname}</span>
            {requireVerification && realName && (
              <>
                <span className="text-xs text-muted-foreground opacity-60">|</span>
                <span className="text-xs text-muted-foreground truncate">{realName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isCaptain && <Badge variant="default">隊長</Badge>}
            {isWaiting && <Badge variant="secondary">候補</Badge>}
          </div>
        </div>
        {details.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap">
            {details.map((detail, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="opacity-50">•</span>}
                <span>{detail}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}