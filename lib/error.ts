import { toast } from 'react-toastify';
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface ApiErrorResponseData {
  code?: string;
  message?: string;
  timestamp?: string;
}

export const handleApiError = (error: any, router?: AppRouterInstance) => {
  const apiErrorData: Partial<ApiErrorResponseData> = error?.response?.data || {};
  const message = apiErrorData.message;

  // 顯示後端的 message，如果有的話
  if (message) {
    toast.error(message);
    return;
  }

  // fallback 顯示
  const fallback =
    error instanceof Error
      ? error.message
      : '操作失敗，請稍後再試';

  toast.error(fallback);
};