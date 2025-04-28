// lib/api.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

export const dispatchAuthStateChange = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('fcm_token');
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

// --- Error Interceptor ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const status = response?.status;

    console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url} - Status: ${status}`, response || error.message);

    return Promise.reject(error);
  }
);

// --- Unified auth error handler ---
export const handleAuthError = (error: any) => {
  const status = error?.response?.status;

  if (status === 404) {
    // 404 = not authenticated
    return 'not_authenticated';
  }

  if (status === 401) {
    // 401 = login expired
    dispatchAuthStateChange();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return 'unauthorized';
  }

  console.error('Unexpected auth error:', error);
  return 'error';
};