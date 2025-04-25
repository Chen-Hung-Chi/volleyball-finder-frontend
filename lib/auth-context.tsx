"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from './types';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/me`, {
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("未登入");
      
      const userData = await res.json();
      console.log('[AuthProvider] User authenticated:', userData.nickname);
      setUser(userData);
    } catch (error) {
      console.log('[AuthProvider] Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AuthProvider] Initial mount: running checkAuthStatus.');
    checkAuthStatus();

    const handleAuthStateChanged = () => {
      console.log('[AuthProvider] Event listener triggered: running checkAuthStatus.');
      checkAuthStatus();
    };

    window.addEventListener('authStateChanged', handleAuthStateChanged);
    return () => {
      console.log('[AuthProvider] Cleanup: removing event listener.');
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
    };
  }, []);

  const logout = async () => {
    console.log('[AuthProvider] Logging out...');
    try {
      const res = await fetch(`${BASE_URL}/users/logout`, {
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("登出失敗");
      
      setUser(null);
      console.log('[AuthProvider] Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('登出失敗，請稍後再試');
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch(`${BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("更新失敗");

      const updatedUser = await res.json();
      setUser(updatedUser);
      console.log('[AuthProvider] User state updated after updateUser call.');
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('更新個人資料失敗');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser, checkAuthStatus, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 