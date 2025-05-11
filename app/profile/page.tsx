"use client"

import React, { memo, Suspense, useState, useCallback, useRef, useEffect } from "react"
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
    isLoading, // Keep isLoading check inside for data fetching within hook
    isSubmitting,
    control,
    handleSubmit,
    errors,
    onSubmit,
    form // Destructure form object to access setValue etc.
  } = useProfileForm();

  // State for nickname check
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>({ status: 'idle', message: '' });
  // Store the initial nickname to avoid checking if it hasn't changed
  const [initialNickname, setInitialNickname] = useState<string | null>(null);
  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial nickname once form data is loaded and form is populated/reset
  useEffect(() => {
    // Check if form is ready (not loading) and reset (or populated without user interaction)
    // formState.isSubmitted === false && formState.isDirty === false checks if the form hasn't been interacted with
    if (!isLoading && form.formState.isSubmitted === false && form.formState.isDirty === false) {
      const currentNickname = form.getValues('nickname');
      // Only set initialNickname if the form value is actually available
      if (currentNickname !== undefined && currentNickname !== null) {
        setInitialNickname(currentNickname);
      }
    }
    // Cleanup timer on unmount or when component re-renders in a way that invalidates the old ref
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isLoading, form]); // Depend on isLoading and form instance to re-run effect if these change

  // Debounced function to perform the actual check
  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    // This function is only called by handleNicknameChange when a check is needed
    // The status is already set to 'checking' by the caller.
    try {
      const result = await apiService.checkNickname(nickname);
      setNicknameStatus({
        status: result.available ? 'available' : 'taken',
        message: result.message
      });
    } catch (e) {
      // Errors are now primarily handled by the global interceptor toast (assuming)
      // We still set status to taken for UI feedback
      console.error("Error during nickname check:", e); // Log for debug
      setNicknameStatus({ status: 'taken', message: '檢查時發生錯誤' });
    }
  }, [initialNickname]); // Dependency: Needs initialNickname to compare if the *current* nickname is the original one

  // Handler for nickname input change (updates RHF value and triggers debounced check)
  const handleNicknameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentNickname = event.target.value;

    // Update RHF value immediately
    // Using setValue allows us to control the value and dirty state simultaneously
    form.setValue('nickname', currentNickname, { shouldDirty: true }); // Mark as dirty when changed

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedNickname = currentNickname.trim();

    // If input is empty or matches initial nickname (after trimming for comparison)
    if (!trimmedNickname || trimmedNickname === initialNickname) {
      setNicknameStatus({ status: 'idle', message: '' });
      return; // No check needed, exit
    }

    // If input is non-empty and different from initial, set status to checking and start debounce timer
    setNicknameStatus({ status: 'checking', message: '' });
    debounceTimerRef.current = setTimeout(() => {
      checkNicknameAvailability(trimmedNickname); // Pass trimmed value to the check function
    }, 500); // 500ms debounce delay

  }, [initialNickname, checkNicknameAvailability, form]); // Dependencies: initialNickname, checkNicknameAvailability (callback), form (for setValue)


  if (isLoading) {
    // Keep isLoading check inside as hook manages data fetch state
    // Suspense handles the initial component render before the hook might finish loading
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <ProfileFormSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">個人資訊</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Real Name Field */}
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

          {/* Nickname Field */}
          <div className="space-y-2">
            <Label htmlFor="nickname">暱稱</Label>
            <div className="relative flex items-center">
              <Controller
                name="nickname"
                control={control}
                // Destructure field props needed, handle onChange manually
                render={({ field: { onBlur, value, name, ref } }) => (
                  <MemoizedInput
                    id="nickname"
                    name={name}
                    value={value || ''} // Bind RHF value
                    ref={ref}
                    placeholder="請輸入暱稱"
                    maxLength={10}
                    onChange={handleNicknameChange} // Use the custom handler instead of field.onChange
                    onBlur={onBlur}
                    // Apply border color based on RHF errors or nickname status
                    className={cn(
                      errors.nickname && nicknameStatus.status === 'idle' && "border-red-500", // RHF error when not actively checking/status known
                      nicknameStatus.status === 'taken' && "border-red-500", // API check shows taken
                      nicknameStatus.status === 'available' && "border-green-500" // API check shows available
                      // Add default border color classes from shadcn if needed, e.g., "border border-input"
                    )}
                  />
                )}
              />
              {/* Nickname Status Icon */}
              <div className="absolute right-3 flex items-center">
                {nicknameStatus.status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {nicknameStatus.status === 'available' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {nicknameStatus.status === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            {/* Nickname Status/Error Message */}
            <p className={cn(
              "text-sm h-[20px]", // Fixed height to prevent layout shift
              // Text color based on status or RHF error
              (nicknameStatus.status === 'taken' || (errors.nickname && nicknameStatus.status === 'idle')) && 'text-red-500',
              nicknameStatus.status === 'available' && 'text-green-500'
            )}>
              {/* Prioritize API status message, then RHF error message */}
              {(nicknameStatus.status !== 'idle')
                ? nicknameStatus.message // Show status message if checking, taken, or available
                : errors.nickname?.message // Otherwise, show RHF error message if available
              }
              {/* Use a non-breaking space to maintain height if no message is displayed */}
              {!(
                (nicknameStatus.status !== 'idle' && nicknameStatus.message) || // Check if status message is showing
                (nicknameStatus.status === 'idle' && errors.nickname?.message) // Check if RHF error message is showing
              ) && <>&nbsp;</> // If neither is showing, render space
              }
            </p>
          </div>

          {/* Position & Level */}
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
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position.message}</p>
              )}
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
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>
          </div>

          {/* Volleyball Age & Gender */}
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
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Introduction */}
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

          {/* Avatar */}
          <div className="space-y-2">
            <Label>頭像</Label>
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <AvatarSelector
                  value={field.value || 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'} // Default fallback if value is null/undefined
                  onChange={field.onChange}
                />
              )}
            />
            {errors.avatar && (
              <p className="text-sm text-red-500">{errors.avatar.message}</p>
            )}
          </div>

          {/* Action Buttons */}
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
              // Disable if submitting or nickname is taken
              disabled={isSubmitting || nicknameStatus.status === 'taken'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  儲存中...
                </>
              ) : "儲存"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default function Profile() {
  // Suspense is used here for potential nested components that might use React.lazy or other Suspense-enabled features
  // The primary data fetching for the form is handled by the useProfileForm hook and its isLoading state
  return (
    <Suspense fallback={<ProfileFormSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  )
}