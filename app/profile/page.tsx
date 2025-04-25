"use client"

import { memo, Suspense } from "react"
import { Controller } from "react-hook-form"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarSelector } from "@/components/user/avatar-selector"
import { useRouter } from "next/navigation"
import { POSITIONS, LEVELS, GENDERS } from "@/lib/constants"
import { useProfileForm } from "@/lib/hooks/useProfileForm"
import { ProfileFormSkeleton } from "@/components/profile/ProfileFormSkeleton"

const MemoizedInput = memo(Input)
const MemoizedSelect = memo(Select)
const MemoizedTextarea = memo(Textarea)

function ProfilePageContent() {
  const router = useRouter();
  const {
    isLoading,
    isSubmitting,
    control,
    handleSubmit,
    errors,
    onSubmit,
  } = useProfileForm();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <ProfileFormSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">個人資料</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="realName">真實姓名</Label>
              <Controller
                name="realName"
                control={control}
                render={({ field }) => (
                  <MemoizedInput
                    id="realName"
                    {...field}
                    placeholder="請輸入真實姓名"
                  />
                )}
              />
              {errors.realName && (
                <p className="text-sm text-red-500">{errors.realName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">暱稱</Label>
              <Controller
                name="nickname"
                control={control}
                render={({ field }) => (
                  <MemoizedInput
                    id="nickname"
                    {...field}
                    placeholder="請輸入暱稱"
                    maxLength={10}
                  />
                )}
              />
              {errors.nickname && (
                <p className="text-sm text-red-500">{errors.nickname.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">位置</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <MemoizedSelect
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇位置" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </MemoizedSelect>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">程度</Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <MemoizedSelect
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇程度" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </MemoizedSelect>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="volleyballAge">球齡</Label>
              <Controller
                name="volleyballAge"
                control={control}
                render={({ field }) => (
                  <MemoizedInput
                    id="volleyballAge"
                    type="number"
                    min="0"
                    {...field}
                    value={field.value || 0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    placeholder="請輸入球齡"
                  />
                )}
              />
              {errors.volleyballAge && (
                <p className="text-sm text-red-500">{errors.volleyballAge.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <MemoizedSelect
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇性別" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </MemoizedSelect>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduction">自我介紹</Label>
            <Controller
              name="introduction"
              control={control}
              render={({ field }) => (
                <MemoizedTextarea
                  id="introduction"
                  {...field}
                  value={field.value || ''}
                  placeholder="請輸入自我介紹"
                  rows={4}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>頭像</Label>
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <AvatarSelector
                  value={field.value || 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => router.push('/')}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default function Profile() {
  return (
    <Suspense fallback={<ProfileFormSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  )
}