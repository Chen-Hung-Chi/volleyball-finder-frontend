"use client";

import React, { memo } from 'react';
import { Control, Controller, FormState } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarSelector } from "@/components/user/avatar-selector";
import { POSITIONS, LEVELS, GENDERS } from "@/lib/constants";
import { ProfileFormData } from '@/lib/schemas/profile';
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MemoizedInput = memo(Input);
const MemoizedSelect = memo(Select);
const MemoizedTextarea = memo(Textarea);

interface ProfileStep2FormProps {
  control: Control<ProfileFormData>;
  errors: FormState<ProfileFormData>['errors'];
  nicknameStatus: { status: 'idle' | 'checking' | 'available' | 'taken', message: string };
  handleNicknameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviousStep: () => void;
  isSubmitting: boolean;
  showPreviousButton: boolean;
}

export function ProfileStep2Form({
  control,
  errors,
  nicknameStatus,
  handleNicknameChange,
  onPreviousStep,
  isSubmitting,
  showPreviousButton,
}: ProfileStep2FormProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-zinc-100">個人資訊</h1>
        {showPreviousButton && (
          <Button
            type="button"
            variant="outline"
            onClick={onPreviousStep}
            className="dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            上一步
          </Button>
        )}
      </div>
      <div className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname" className="dark:text-zinc-100">暱稱</Label>
          <div className="relative flex items-center">
            <Controller
              name="nickname"
              control={control}
              render={({ field: { onBlur, value, name, ref } }) => (
                <MemoizedInput
                  id="nickname"
                  name={name}
                  value={value || ''}
                  ref={ref}
                  placeholder="請輸入暱稱"
                  maxLength={10}
                  onChange={handleNicknameChange}
                  onBlur={onBlur}
                  className={cn(
                    "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400",
                    errors.nickname && nicknameStatus.status === 'idle' && "border-red-500",
                    nicknameStatus.status === 'taken' && "border-red-500",
                    nicknameStatus.status === 'available' && "border-green-500"
                  )}
                />
              )}
            />
            <div className="absolute right-3 flex items-center">
              {nicknameStatus.status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground dark:text-zinc-400" />}
              {nicknameStatus.status === 'available' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {nicknameStatus.status === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          <p className={cn(
            "text-sm h-[20px]",
            (nicknameStatus.status === 'taken' || (errors.nickname && nicknameStatus.status === 'idle')) && 'text-red-500 dark:text-red-400',
            nicknameStatus.status === 'available' && 'text-green-500',
            nicknameStatus.status === 'checking' && 'dark:text-zinc-400'
          )}>
            {(nicknameStatus.status !== 'idle')
              ? nicknameStatus.message
              : errors.nickname?.message
            }
            {!((
              (nicknameStatus.status !== 'idle' && nicknameStatus.message) ||
              (nicknameStatus.status === 'idle' && errors.nickname?.message)
            )) && <>&nbsp;</>}
          </p>
        </div>
      </div>
      <div className="p-4 rounded-xl border dark:bg-zinc-900 dark:border-zinc-700">
        <div className="font-semibold mb-2 dark:text-zinc-100">球員屬性</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="position" className="dark:text-zinc-100">位置</Label>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <MemoizedSelect
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    <SelectValue placeholder="選擇位置" className="dark:text-zinc-100 dark:placeholder-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value} className="dark:bg-zinc-800 dark:text-zinc-100">
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </MemoizedSelect>
              )}
            />
            {errors.position && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.position.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="level" className="dark:text-zinc-100">程度</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <MemoizedSelect
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    <SelectValue placeholder="選擇程度" className="dark:text-zinc-100 dark:placeholder-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    {LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="dark:bg-zinc-800 dark:text-zinc-100">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </MemoizedSelect>
              )}
            />
            {errors.level && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.level.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="volleyballAge" className="dark:text-zinc-100">球齡</Label>
            <Controller
              name="volleyballAge"
              control={control}
              render={({ field }) => (
                <MemoizedInput
                  id="volleyballAge"
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0} // Ensure value is not undefined for controlled component
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  placeholder="請輸入球齡"
                  className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                />
              )}
            />
            {errors.volleyballAge && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.volleyballAge.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="dark:text-zinc-100">性別</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <MemoizedSelect
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    <SelectValue placeholder="選擇性別" className="dark:text-zinc-100 dark:placeholder-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value} className="dark:bg-zinc-800 dark:text-zinc-100">
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </MemoizedSelect>
              )}
            />
            {errors.gender && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="introduction" className="dark:text-zinc-100">自我介紹</Label>
          <Controller
            name="introduction"
            control={control}
            render={({ field }) => (
              <MemoizedTextarea
                id="introduction"
                {...field}
                value={field.value || ''} // Ensure value is not undefined
                placeholder="請輸入自我介紹"
                rows={4}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
              />
            )}
          />
           {errors.introduction && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.introduction.message}</p>
            )}
        </div>
      </div>
      <div className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label className="dark:text-zinc-100">頭像</Label>
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
          {errors.avatar && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.avatar.message}</p>
          )}
        </div>
      </div>
      {/* Submit button is handled by the parent form in page.tsx */}
    </div>
  );
} 