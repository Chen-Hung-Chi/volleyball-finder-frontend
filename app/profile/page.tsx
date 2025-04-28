"use client"

import React, { memo, Suspense, useState, useCallback, useRef } from "react"
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
import { apiService } from "@/lib/apiService"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const MemoizedInput = memo(Input)
const MemoizedSelect = memo(Select)
const MemoizedTextarea = memo(Textarea)

// Type for nickname check state
type NicknameStatus = { status: 'idle' | 'checking' | 'available' | 'taken', message: string };

function ProfilePageContent() {
  const router = useRouter();
  const {
    isLoading,
    isSubmitting,
    control,
    handleSubmit,
    errors,
    onSubmit,
    form
  } = useProfileForm();

  // State for nickname check
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>({ status: 'idle', message: '' });
  // Store the initial nickname to avoid checking if it hasn't changed
  const [initialNickname, setInitialNickname] = useState<string | null>(null);
  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial nickname when form data loads
  React.useEffect(() => {
    if (!isLoading && form.formState.isDirty === false) {
      setInitialNickname(form.getValues('nickname'));
    }
    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isLoading, form]);

  // Debounced function to perform the actual check
  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    // Don't check if empty or hasn't changed from initial
    if (!nickname || nickname === initialNickname) {
      // Reset if it was previously invalid and now matches initial or is empty
      if ((nickname === initialNickname || !nickname) && nicknameStatus.status === 'taken') {
        setNicknameStatus({ status: 'idle', message: '' });
      } else if (!nickname && nicknameStatus.status !== 'idle') {
        // Clear status if field is emptied
        setNicknameStatus({ status: 'idle', message: '' });
      }
      return;
    }

    setNicknameStatus({ status: 'checking', message: '' });
    try {
      const result = await apiService.checkNickname(nickname);
      setNicknameStatus({
        status: result.available ? 'available' : 'taken',
        message: result.message
      });
    } catch (e) {
      // Errors are now primarily handled by the global interceptor toast
      // We still set status to taken for UI feedback, but avoid double console.error
      console.log("Error caught during nickname check processing:", e); // Log for debug if needed
      setNicknameStatus({ status: 'taken', message: '檢查時發生錯誤' });
    }
  }, [initialNickname, nicknameStatus.status]); // Keep nicknameStatus.status dependency for now


  // Handler for nickname input change (triggers debounced check)
  const handleNicknameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentNickname = event.target.value.trim();

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear status immediately if input is empty or matches initial
    if (!currentNickname || currentNickname === initialNickname) {
      setNicknameStatus({ status: 'idle', message: '' });
      return; // Don't set a timer if no check is needed
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      checkNicknameAvailability(currentNickname);
    }, 500); // 500ms debounce

  }, [initialNickname, checkNicknameAvailability]); // Depend on initialNickname and the check function

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
              <div className="relative flex items-center">
                <Controller
                  name="nickname"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name, ref } }) => (
                    <MemoizedInput
                      id="nickname"
                      name={name}
                      value={value || ''}
                      ref={ref}
                      placeholder="請輸入暱稱"
                      maxLength={10}
                      onChange={(e) => {
                        onChange(e);
                        handleNicknameChange(e);
                      }}
                      onBlur={onBlur}
                      className={cn(
                        errors.nickname && nicknameStatus.status === 'idle' && "border-red-500",
                        nicknameStatus.status === 'taken' && "border-red-500",
                        nicknameStatus.status === 'available' && "border-green-500"
                      )}
                    />
                  )}
                />
                <div className="absolute right-3 flex items-center">
                  {nicknameStatus.status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {nicknameStatus.status === 'available' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {nicknameStatus.status === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <p className={cn(
                "text-sm h-[20px]",
                nicknameStatus.status === 'taken' && 'text-red-500',
                nicknameStatus.status === 'available' && 'text-green-500',
                errors.nickname && nicknameStatus.status === 'idle' && 'text-red-500'
              )}>
                {(nicknameStatus.status === 'taken' || nicknameStatus.status === 'available') && nicknameStatus.message
                  ? nicknameStatus.message
                  : errors.nickname && nicknameStatus.status === 'idle'
                    ? errors.nickname.message
                    : <>&nbsp;</>
                }
              </p>
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
              disabled={isSubmitting || nicknameStatus.status === 'taken'}
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