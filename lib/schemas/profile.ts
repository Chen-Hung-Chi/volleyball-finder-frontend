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
  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>; 