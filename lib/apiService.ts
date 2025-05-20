// lib/apiService.ts
import { api, handleAuthError, dispatchAuthStateChange } from './api';
import { Activity, ActivityWithParticipants, ActivityParticipantDto, User } from './types';
import { Position, Level, CityCode, DistrictCode } from './constants';
import { ActivityCreate, ActivityUpdate, ActivityJoinRequest, SearchParams } from './types/api';

// Ideally, this interface would go into a central types.ts file
export interface CaptainViewParticipantDetails {
  id: string;
  phone?: string;
}

export const apiService = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await api.get('/users/me');
      return true;
    } catch (error: any) {
      const result = handleAuthError(error);
      return result !== 'error';
    }
  },

  logout: async () => {
    try {
      // 通知後端登出
      await api.post('/users/logout');

      // 清掉 localStorage 裡的登入資訊
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('fcm_token');

      // 發送登出事件（讓其他地方也知道登出了）
      window.dispatchEvent(new Event('authStateChanged'));

      // 選擇跳回登入畫面
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error: any) {
      const result = handleAuthError(error);
      if (result === 'not_authenticated' || result === 'unauthorized') {
        return null;
      }
      throw error;
    }
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const res = await api.put<User>(`/users/${userId}`, data);
    return res.data;
  },

  updateFcmToken: async (fcmToken: string): Promise<void> => {
    await api.patch('/users/fcm-token', { fcmToken });
  },

  getUserProfile: async (userId: string): Promise<User> => {
    const res = await api.get<User>(`/users/${userId}`);
    return res.data;
  },

  checkNickname: async (nickname: string): Promise<{ available: boolean; message: string }> => {
    try {
      const res = await api.get<{ success: boolean }>(`/users/check-nickname`, { params: { nickname } });
      return res.data.success
        ? { available: true, message: "此暱稱可以使用" }
        : { available: false, message: "此暱稱已被使用" };
    } catch (error: any) {
      console.error('Nickname check error:', error.response?.data || error.message);
      return { available: false, message: "檢查暱稱時發生錯誤" };
    }
  },

  searchActivities: async (params: SearchParams): Promise<{ items: Activity[]; total: number; page: number; totalPages: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const res = await api.get(`/activities/search?${searchParams}`);
    return res.data;
  },

  getActivity: async (id: string): Promise<Activity> => {
    const res = await api.get<Activity>(`/activities/${id}`);
    return res.data;
  },

  getActivityParticipants: async (id: string): Promise<ActivityWithParticipants> => {
    const [activityRes, participantsRes] = await Promise.all([
      api.get<Activity>(`/activities/${id}`),
      api.get<ActivityParticipantDto[]>(`/activities/${id}/participants`),
    ]);

    const activity = activityRes.data;
    const participants = participantsRes.data;
    const captain = participants.find(p => p.isCaptain);

    const captainAsUser: User | null = captain
      ? {
        id: captain.userId,
        lineId: captain.lineId ?? '',
        nickname: captain.nickname,
        realName: captain.realName ?? '',
        role: captain.role ?? 'USER',
        position: captain.position as Position | undefined,
        level: captain.level as Level | null,
        volleyballAge: captain.volleyballAge ?? null,
        avatar: captain.avatar ?? '',
        city: captain.city as CityCode | undefined,
        district: captain.district as DistrictCode | undefined,
        introduction: captain.introduction ?? '',
        gender: captain.gender,
        createdAt: captain.userCreatedAt ?? new Date().toISOString(),
        updatedAt: captain.userUpdatedAt ?? new Date().toISOString(),
      }
      : null;

    return { ...activity, participants, waitingList: [], captain: captainAsUser };
  },

  getActivityParticipantDetailsForCaptain: async (activityId: string, userIds: string[]): Promise<CaptainViewParticipantDetails[]> => {
    if (userIds.length === 0) {
      return [];
    }
    const idsParam = userIds.join(',');
    const res = await api.get<CaptainViewParticipantDetails[]>(`/activities/${activityId}/users?ids=${idsParam}`);
    return res.data;
  },

  createActivity: async (data: ActivityCreate): Promise<Activity> => {
    const res = await api.post<Activity>('/activities', data);
    return res.data;
  },

  updateActivity: async (id: string, data: ActivityUpdate): Promise<Activity> => {
    const res = await api.put<Activity>(`/activities/${id}`, data);
    return res.data;
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
    const res = await api.get<Activity[]>(`/activities/user/${userId}`);
    return res.data;
  },

  getMyActivities: async (): Promise<Activity[]> => {
    const res = await api.get<Activity[]>('/activities/me');
    return res.data;
  },

  getNotifications: async (): Promise<any[]> => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    if (!id) return;
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
};