import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity, ActivityWithParticipants, ActivityParticipantDto, User } from './types';
import { Position, Level, CityCode, DistrictCode } from './constants';
import { ApiError, ActivityCreate, ActivityUpdate, ActivityJoinRequest, SearchParams } from './types/api';

// --- Common utilities ---
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

const dispatchAuthStateChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

// --- Toast Control (防止狂跳) ---
const errorToastId = 'api-error-toast';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    const responseData = error.response?.data;
    const status = error.response?.status;
    const message = responseData?.message || '操作失敗，請稍後再試';
    const code = responseData?.code;

    console.error(
      `[API Error] ${config?.method?.toUpperCase()} ${config?.url} - Status: ${status}`,
      responseData || error.message
    );

    if (status === 401 || code === 'USER_NOT_FOUND') {
      dispatchAuthStateChange();
      toast.error('請先登入', { toastId: errorToastId });
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      if (code === 'FORBIDDEN' && message.includes('請求過於頻繁')) {
        if (typeof window !== 'undefined') window.location.href = '/too-many-requests';
      } else {
        toast.error(message, { toastId: errorToastId });
      }
      return Promise.reject(error);
    }

    if (status >= 400 && status < 600) {
      toast.error(message, { toastId: errorToastId });
    } else if (!error.response) {
      toast.error('網路錯誤，請檢查您的連線', { toastId: errorToastId });
    } else {
      toast.error('發生預期外的錯誤', { toastId: errorToastId });
    }

    return Promise.reject(error);
  }
);

// --- API Service ---
export const apiService = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await api.get('/users/me');
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatchAuthStateChange();
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  checkNickname: async (nickname: string): Promise<{ available: boolean; message: string }> => {
    try {
      // Backend now returns 200 OK with { success: boolean }
      const response = await api.get<{ success: boolean }>(`/users/check-nickname`, {
        params: { nickname }
      });
      
      // Map backend response to the frontend's expected format
      if (response.data.success) {
        return { available: true, message: "此暱稱可以使用" };
      } else {
        // Assume success: false means nickname is taken
        return { available: false, message: "此暱稱已被使用" }; 
      }

    } catch (error: any) {
      // Catch actual network/server errors (non-2xx status)
      console.error('Unexpected error during nickname check:', error.response?.data || error.message);
      // Global interceptor likely shows a toast
      // Return unavailable as a safe default for UI feedback
      return { available: false, message: "檢查暱稱時發生錯誤" }; 
    }
  },

  searchActivities: async (params: SearchParams): Promise<{ items: Activity[]; total: number; page: number; totalPages: number; }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const response = await api.get<{ items: Activity[]; total: number; page: number; totalPages: number; }>(`/activities/search?${searchParams.toString()}`);
    return response.data;
  },

  getActivity: async (id: string): Promise<Activity> => {
    const response = await api.get<Activity>(`/activities/${id}`);
    return response.data;
  },

  getActivityParticipants: async (id: string): Promise<ActivityWithParticipants> => {
    const activityRes = await api.get<Activity>(`/activities/${id}`);
    const participantsRes = await api.get<ActivityParticipantDto[]>(`/activities/${id}/participants`);

    const activity = activityRes.data;
    const participants = participantsRes.data;
    const captain = participants.find(p => p.isCaptain);

    const captainAsUser: User | null = captain ? {
      id: captain.userId,
      lineId: captain.lineId ?? '',
      nickname: captain.nickname,
      realName: captain.realName,
      position: captain.position as Position | undefined,
      level: captain.level as Level | null,
      volleyballAge: captain.volleyballAge,
      avatar: captain.avatar,
      city: captain.city as CityCode | undefined,
      district: captain.district as DistrictCode | undefined,
      introduction: captain.introduction,
      gender: captain.gender,
      createdAt: captain.userCreatedAt ?? new Date().toISOString(),
      updatedAt: captain.userUpdatedAt ?? new Date().toISOString(),
    } : null;

    return {
      ...activity,
      participants,
      waitingList: [],
      captain: captainAsUser,
    };
  },

  createActivity: async (data: ActivityCreate): Promise<Activity> => {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  },

  updateActivity: async (id: string, data: ActivityUpdate): Promise<Activity> => {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },

  joinActivity: async (id: string, data: ActivityJoinRequest): Promise<void> => {
    await api.post(`/activities/${id}/join`, data);
  },

  leaveActivity: async (id: string): Promise<void> => {
    await api.post(`/activities/${id}/leave`);
  },

  getUserActivities: async (userId: string): Promise<Activity[]> => {
    const response = await api.get<Activity[]>(`/activities/user/${userId}`);
    return response.data;
  },

  getMyActivities: async (): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/activities/me');
    return response.data;
  },

  getNotifications: async (): Promise<any[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};