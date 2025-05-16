import { z } from 'zod';

export const profileSchema = z.object({
  realName: z.string().optional(),
  nickname: z.string()
    .min(1, '請輸入暱稱')
    .max(10, '暱稱不能超過10個字'),
  position: z.enum(['NONE', 'SPIKER', 'SETTER', 'LIBERO'] as const).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const).optional(),
  volleyballAge: z.number().min(0, '年資不能小於0').optional(),
  gender: z.enum(['MALE', 'FEMALE'] as const).optional(),
  introduction: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
})
.superRefine((data, ctx) => {
  // Check if phone exists and is likely a verified format (e.g., 10 digits starting with 09)
  // The actual verification happens in PhoneVerification.tsx, this is for form validation logic.
  const phoneLikelyVerified = data.phone && /^09\d{8}$/.test(data.phone);

  if (phoneLikelyVerified) {
    if (!data.realName || String(data.realName).trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "手機驗證後，真實姓名為必填",
        path: ['realName'],
      });
    }
    if (data.realName && !/^[\u4e00-\u9fa5]{2,}$/.test(String(data.realName).trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入正確的中文姓名 (至少兩個中文字)",
        path: ['realName'],
      });
    }
  }
});

export type ProfileFormData = z.infer<typeof profileSchema>; 