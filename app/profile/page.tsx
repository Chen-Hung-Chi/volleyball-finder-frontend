"use client"

import React, { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useProfileForm } from "@/lib/hooks/useProfileForm"
import { ProfileFormSkeleton } from "@/components/profile/ProfileFormSkeleton"
import { apiService } from "@/lib/apiService"
import { Loader2 } from "lucide-react"

import { ProfileStep1Form } from "@/components/profile/ProfileStep1Form";
import { ProfileStep2Form } from "@/components/profile/ProfileStep2Form";

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
    form,
    user
  } = useProfileForm();

  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>({ status: 'idle', message: '' });
  const [initialNickname, setInitialNickname] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [step, setStep] = useState<1 | 2 | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (user?.isVerified) {
        setStep(2);
      } else {
        setStep(1);
      }
    }
    if (!isLoading && form.formState.isSubmitted === false && form.formState.isDirty === false) {
      const currentNickname = form.getValues('nickname');
      if (currentNickname !== undefined && currentNickname !== null) {
        setInitialNickname(currentNickname);
      }
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    setNicknameStatus({ status: 'checking', message: '' });
    try {
      const result = await apiService.checkNickname(nickname);
      setNicknameStatus({
        status: result.available ? 'available' : 'taken',
        message: result.message
      });
    } catch (e) {
      console.error("Error during nickname check:", e);
      setNicknameStatus({ status: 'taken', message: '檢查時發生錯誤' });
    }
  }, []);

  const handleNicknameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentNickname = event.target.value;
    form.setValue('nickname', currentNickname, { shouldDirty: true, shouldValidate: true });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const trimmedNickname = currentNickname.trim();
    if (!trimmedNickname || trimmedNickname === initialNickname) {
      setNicknameStatus({ status: 'idle', message: '' });
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      checkNicknameAvailability(trimmedNickname);
    }, 500);
  }, [initialNickname, checkNicknameAvailability, form]);

  if (isLoading || step === null) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <ProfileFormSkeleton />
      </div>
    );
  }

  const handleNextStep = () => setStep(2);
  const handlePreviousStep = () => setStep(1);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <ProfileStep1Form
              form={form}
              control={control}
              onNextStep={handleNextStep}
            />
          )}

          {step === 2 && (
            <ProfileStep2Form
              control={control}
              errors={errors}
              nicknameStatus={nicknameStatus}
              handleNicknameChange={handleNicknameChange}
              onPreviousStep={handlePreviousStep}
              isSubmitting={isSubmitting}
              showPreviousButton={!user?.isVerified}
            />
          )}

          {step === 2 && (
            <div className="flex justify-between items-center mt-8 pt-8 border-t border-border">
              <div />
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isSubmitting}
                  className="dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || nicknameStatus.status === 'taken'}
                  className="dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      儲存中...
                    </>
                  ) : "儲存"}
                </Button>
              </div>
            </div>
          )}
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