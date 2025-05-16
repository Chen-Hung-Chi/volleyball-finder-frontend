"use client";

import React from 'react';
import { Control, Controller, UseFormReturn } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneVerification } from "@/components/profile/PhoneVerification";
import { ProfileFormData } from '@/lib/schemas/profile';
import { toast } from 'react-toastify';

interface ProfileStep1FormProps {
  form: UseFormReturn<ProfileFormData>;
  control: Control<ProfileFormData>;
  onNextStep: () => void;
}

const MemoizedInput = React.memo(Input);

export function ProfileStep1Form({
  form,
  control,
  onNextStep,
}: ProfileStep1FormProps) {
  const handlePhoneVerified = (verifiedPhone: string | number | null) => {
    const phoneString = String(verifiedPhone || '');
    form.setValue("phone", phoneString, { shouldValidate: true, shouldDirty: true });
  };

  const handleNextButtonClick = async () => {
    const isRealNameValid = await form.trigger("realName");
    const isPhoneValid = await form.trigger("phone");

    if (isRealNameValid && isPhoneValid) {
      onNextStep();
    } else {
      if (!isRealNameValid && form.formState.errors.realName?.message) {
        document.getElementById("realName")?.focus();
        toast.warning(form.formState.errors.realName.message);
      } else if (!isPhoneValid && form.formState.errors.phone?.message) {
        toast.warning(form.formState.errors.phone.message);
      } else if (!isRealNameValid) {
        document.getElementById("realName")?.focus();
        toast.warning("請填寫正確的真實姓名。");
      } else if (!isPhoneValid) {
        toast.warning("請驗證您的手機號碼。");
      }
    }
  };

  const isNextButtonDisabled = !form.formState.isValid;

  return (
    <div className="space-y-8">
      <div className="pt-4">
        <div className="rounded-lg border p-4 space-y-4 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-lg font-semibold dark:text-zinc-100">實名制資訊</h2>
          <div className="flex items-start gap-3 py-2">
            <span className="mt-0.5 text-blue-500 dark:text-blue-400">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="15.5" r="1" fill="currentColor" />
              </svg>
            </span>
            <div>
              <p className="text-base font-medium text-foreground dark:text-zinc-100 mb-1">
                報名前請完成以下實名制資訊
              </p>
              <p className="text-sm text-muted-foreground dark:text-zinc-400 leading-relaxed">
                場次若需實名制，必須填寫完畢才能報名。<br />
                若暫時不需報名實名制場次，可略過本步驟。
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="realName" className="dark:text-zinc-100">
              真實姓名 <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="realName"
              control={control}
              render={({ field }) => (
                <MemoizedInput
                  id="realName"
                  {...field}
                  value={field.value || ''}
                  placeholder="請輸入真實姓名"
                  className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                />
              )}
            />
            {form.formState.errors.realName && (
              <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.realName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="font-medium dark:text-zinc-100">
              手機號碼 <span className="text-red-500">*</span>
            </Label>
            <PhoneVerification
              initialPhone={String(form.getValues("phone") || "")}
              onVerified={handlePhoneVerified}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={isNextButtonDisabled}
          onClick={handleNextButtonClick}
          className="dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          下一步
        </Button>
      </div>
    </div>
  );
} 