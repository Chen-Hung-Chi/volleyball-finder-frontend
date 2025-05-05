"use client";

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SponsorFormData } from '@/lib/types/sponsor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { handleApiError } from '@/lib/error';

// Base schema for common fields
const baseSponsorSchema = z.object({
  name: z.string().min(1, { message: '贊助商名稱為必填' }),
  contactEmail: z.string().email({ message: '請輸入有效的電子信箱' }).optional().or(z.literal('')),
  phone: z.string().min(1, { message: '聯絡電話為必填' }),
  description: z.string().optional(),
  logoUrl: z.string().url({ message: '請輸入有效的 Logo 網址' }).min(1, { message: 'Logo 網址為必填' }),
  websiteUrl: z.string().url({ message: '請輸入有效的網站網址' }).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  useLinePay: z.boolean().default(false),
});

// Schema for create mode with LINE Pay validation
const createSponsorSchema = baseSponsorSchema.extend({
  linePayChannelId: z.string().optional(),
  linePayChannelSecret: z.string().optional(),
  linePayMode: z.enum(['SANDBOX', 'PRODUCTION']).optional(),
}).refine(data => {
  if (!data.useLinePay) return true;
  return !!data.linePayChannelId && !!data.linePayChannelSecret && !!data.linePayMode;
}, {
  message: '啟用 LINE Pay 時，Channel ID、Channel Secret 和 Mode 為必填',
  path: ['useLinePay'],
});

// Schema for edit mode without LINE Pay validation
const editSponsorSchema = baseSponsorSchema.extend({
  linePayChannelId: z.string().optional(),
  linePayChannelSecret: z.string().optional(),
  linePayMode: z.enum(['SANDBOX', 'PRODUCTION']).optional(),
});

type SponsorSchemaType = z.infer<typeof createSponsorSchema>;

interface SponsorFormProps {
  onSubmit: (data: SponsorFormData) => Promise<void>;
  defaultValues?: Partial<SponsorFormData>;
  isLoading?: boolean;
  isEditMode?: boolean;
}

// Reusable input field component
const FormField = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export function SponsorForm({ onSubmit, defaultValues, isLoading = false, isEditMode = false }: SponsorFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<SponsorSchemaType>({
    resolver: zodResolver(isEditMode ? editSponsorSchema : createSponsorSchema),
    defaultValues: {
      ...defaultValues,
      isActive: defaultValues?.isActive ?? true,
      useLinePay: defaultValues?.useLinePay ?? false,
    },
  });

  const useLinePayValue = watch('useLinePay');

  const processSubmit: SubmitHandler<SponsorSchemaType> = async (data) => {
    console.log('[SponsorForm] processSubmit entered.', data);

    const formData: SponsorFormData = {
      ...data,
      contactEmail: data.contactEmail || undefined,
      websiteUrl: data.websiteUrl || undefined,
      linePayChannelId: !isEditMode && data.useLinePay ? data.linePayChannelId : undefined,
      linePayChannelSecret: !isEditMode && data.useLinePay ? data.linePayChannelSecret : undefined,
      linePayMode: !isEditMode && data.useLinePay ? data.linePayMode : undefined,
    };

    try {
      await onSubmit(formData);
      
      console.log('[SponsorForm] onSubmit completed successfully. Showing success toast.');
      toast.success(isEditMode ? '贊助商資料更新成功！' : '贊助商建立成功！');
      router.push('/sponsors');
      router.refresh();

    } catch (error: any) {
      console.error("Sponsor form submission caught error:", error);
      handleApiError(error, router);
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? '編輯贊助商資料' : '建立新的贊助商'}</CardTitle>
          <CardDescription>
            {isEditMode ? '修改您的贊助商資訊。' : '請填寫以下資訊以建立新的贊助商。'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField id="name" label="贊助商名稱*" error={errors.name?.message}>
              <Input id="name" {...register('name')} className={cn(errors.name && 'border-red-500')} />
            </FormField>
            <FormField id="phone" label="聯絡電話*" error={errors.phone?.message}>
              <Input id="phone" {...register('phone')} className={cn(errors.phone && 'border-red-500')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField id="contactEmail" label="聯絡 Email" error={errors.contactEmail?.message}>
              <Input id="contactEmail" type="email" {...register('contactEmail')} className={cn(errors.contactEmail && 'border-red-500')} />
            </FormField>
            <FormField id="websiteUrl" label="網站網址" error={errors.websiteUrl?.message}>
              <Input id="websiteUrl" {...register('websiteUrl')} placeholder="https://..." className={cn(errors.websiteUrl && 'border-red-500')} />
            </FormField>
          </div>

          <FormField id="logoUrl" label="Logo 網址*" error={errors.logoUrl?.message}>
            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://..." className={cn(errors.logoUrl && 'border-red-500')} />
          </FormField>

          <FormField id="description" label="贊助商描述" error={errors.description?.message}>
            <Textarea id="description" {...register('description')} />
          </FormField>

          <div className="flex items-center space-x-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isActive">啟用贊助商</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LINE Pay 設定</CardTitle>
          <CardDescription>如需透過平台接受 LINE Pay 付款，請啟用。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="useLinePay"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="useLinePay"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="useLinePay">啟用 LINE Pay</Label>
          </div>
          {errors.useLinePay && <p className="text-xs text-red-500 mt-1">{errors.useLinePay.message}</p>}

          {useLinePayValue && !isEditMode && (
            <div className="space-y-4 pl-6 border-l-2 border-muted ml-2 pt-2">
              <FormField id="linePayChannelId" label="Channel ID*" error={errors.linePayChannelId?.message}>
                <Input id="linePayChannelId" {...register('linePayChannelId')} className={cn(errors.linePayChannelId && 'border-red-500')} />
              </FormField>
              <FormField id="linePayChannelSecret" label="Channel Secret*" error={errors.linePayChannelSecret?.message}>
                <Input type="password" id="linePayChannelSecret" {...register('linePayChannelSecret')} className={cn(errors.linePayChannelSecret && 'border-red-500')} />
              </FormField>
              <FormField id="linePayMode" label="模式*" error={errors.linePayMode?.message}>
                <Controller
                  name="linePayMode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={cn(errors.linePayMode && 'border-red-500')}>
                        <SelectValue placeholder="選擇模式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SANDBOX">SANDBOX (測試)</SelectItem>
                        <SelectItem value="PRODUCTION">PRODUCTION (正式)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditMode ? '更新中...' : '建立中...') : (isEditMode ? '儲存變更' : '建立贊助商')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}