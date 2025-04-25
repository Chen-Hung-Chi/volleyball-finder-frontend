import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity, ActivityWithParticipants, ActivityParticipantDto, User } from './types';
import { Position, Level, CityCode, DistrictCode } from './constants';
import { ApiError, ActivityCreate, ActivityUpdate, ActivityJoinRequest, SearchParams } from './types/api';

// Common utilities
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

const dispatchAuthStateChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

// Request/Response interceptors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      
      // Specific business logic errors to be handled by components
      const businessErrors = [
        'ACTIVITY_FULL',
        'ACTIVITY_ALREADY_JOINED',
        'ACTIVITY_WAIT_30M', // Handled by component
        'ACTIVITY_NOT_JOINED',
        'ACTIVITY_LEAVED'
      ];
      
      // If it's a business error, let the component handle it (show toast, etc.)
      // Do NOT log it globally here.
      if (businessErrors.includes(apiError.code)) {
        return Promise.reject(error); 
      }
      
      // --- Log and Handle OTHER errors globally --- 
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`, apiError);

      if (error.response?.status === 401 || apiError.code === 'USER_NOT_FOUND') {
        console.log('Unauthorized (401) or User not found.');
        dispatchAuthStateChange();
        toast.error('請先登入');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        if (error.response?.data?.code === 'FORBIDDEN' && error.response?.data?.message?.includes('請求過於頻繁')) {
          window.location.href = '/too-many-requests';
          return Promise.reject(error);
        }
        toast.error("您沒有權限進行此操作");
      } else {
        toast.error(apiError.message || '發生錯誤，請稍後再試');
      }

      return Promise.reject(error);
    }
    
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    toast.error('網路錯誤，請稍後再試');
    return Promise.reject(error);
  }
);

// Auth related APIs
export const apiService = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await api.get('/users/me');
      return true;
    } catch (error) {
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

  // User related APIs
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
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

  // Activity related APIs
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
      lineId: captain.lineId ?? "",
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
      captain: captainAsUser
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

  // Notification related APIs
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