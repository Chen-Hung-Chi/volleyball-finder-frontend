import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from '@/lib/firebase';
import { toast } from "react-toastify";
import { safeLocalStorage } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import axios from "axios";

const rawApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 10000,
});

const uploadFcmToken = async (token: string) => {
    try {
        await rawApi.patch('/users/fcm-token', { fcmToken: token });
        if (process.env.NODE_ENV === 'development') {
            console.log('[useFcm] FCM Token uploaded to server');
        }
        safeLocalStorage.setItem('fcm_token', token);
    } catch (error) {
        console.error('[useFcm] Failed to upload FCM Token:', error);
    }
};

export const useFcm = () => {
    const { user } = useAuth();

    useEffect(() => {
        const setupFcm = async () => {
            if (typeof window === 'undefined') {
                return;
            }

            if (!user) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[useFcm] User not logged in, skip FCM setup');
                }
                return;
            }

            try {
                const messaging = getMessaging(firebaseApp);

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.warn('您尚未允許推播通知，可能無法即時接收活動提醒');
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('[useFcm] Notification permission not granted');
                    }
                    return;
                }

                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                if (!token) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('[useFcm] No FCM token received');
                    }
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log('[useFcm] FCM Token:', token);
                }

                const savedToken = safeLocalStorage.getItem('fcm_token');
                if (savedToken !== token) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[useFcm] Token changed, uploading new token...');
                    }
                    await uploadFcmToken(token);
                } else {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[useFcm] Token unchanged, skipping upload');
                    }
                }

                onMessage(messaging, (payload) => {
                    const title = payload.data?.title || '【活動提醒】';
                    const body = payload.data?.body || '';
                    toast.info(`${title}${body}`);
                });

            } catch (error) {
                console.error('[useFcm] FCM setup failed:', error);
            }
        };

        setupFcm();
    }, [user]);
};