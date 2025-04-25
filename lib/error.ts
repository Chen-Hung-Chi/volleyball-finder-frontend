import { toast } from 'react-toastify';
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export enum ErrorCode {
  // 通用錯誤
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // 用戶相關錯誤
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_USER_DATA = 'INVALID_USER_DATA',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // 活動相關錯誤
  ACTIVITY_NOT_FOUND = 'ACTIVITY_NOT_FOUND',
  ACTIVITY_FULL = 'ACTIVITY_FULL',
  ACTIVITY_CANCELLED = 'ACTIVITY_CANCELLED',
  ACTIVITY_ALREADY_JOINED = 'ACTIVITY_ALREADY_JOINED',
  ACTIVITY_NOT_JOINED = 'ACTIVITY_NOT_JOINED',
  ACTIVITY_PAST_DEADLINE = 'ACTIVITY_PAST_DEADLINE'
}

interface ErrorHandler {
  message: string;
  action?: (router: AppRouterInstance) => void;
}

const errorHandlers: Record<ErrorCode, ErrorHandler> = {
  [ErrorCode.INTERNAL_ERROR]: {
    message: '系統錯誤，請稍後再試'
  },
  [ErrorCode.INVALID_REQUEST]: {
    message: '無效的請求'
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: '請先登入',
    action: (router) => router.push('/login')
  },
  [ErrorCode.FORBIDDEN]: {
    message: '無權限執行此操作'
  },
  [ErrorCode.NOT_FOUND]: {
    message: '找不到資源'
  },
  [ErrorCode.USER_NOT_FOUND]: {
    message: '請先完成個人資料設定',
    action: (router) => router.push('/profile')
  },
  [ErrorCode.USER_ALREADY_EXISTS]: {
    message: '用戶已存在'
  },
  [ErrorCode.INVALID_USER_DATA]: {
    message: '無效的用戶資料'
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    message: '無效的憑證'
  },
  [ErrorCode.ACTIVITY_NOT_FOUND]: {
    message: '找不到此活動'
  },
  [ErrorCode.ACTIVITY_FULL]: {
    message: '活動已額滿'
  },
  [ErrorCode.ACTIVITY_CANCELLED]: {
    message: '活動已取消'
  },
  [ErrorCode.ACTIVITY_ALREADY_JOINED]: {
    message: '你已經報名過此活動'
  },
  [ErrorCode.ACTIVITY_NOT_JOINED]: {
    message: '你尚未報名此活動'
  },
  [ErrorCode.ACTIVITY_PAST_DEADLINE]: {
    message: '已超過報名截止時間'
  }
}

export interface ApiError {
  code: string;
  message: string;
  timestamp?: string;
}

export const handleApiError = (error: any, router: AppRouterInstance) => {
  console.error('API Error:', error);

  // 如果是 API 錯誤（有錯誤代碼）
  if (error.code && error.code in ErrorCode) {
    const handler = errorHandlers[error.code as ErrorCode];
    toast.error(handler.message);
    handler.action?.(router);
    return;
  }

  // 如果是其他錯誤
  toast.error(error.message || '操作失敗，請稍後再試');
}; 