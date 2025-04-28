import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOCATIONS, Level, LEVELS } from "./constants"
import { startOfDay, isBefore } from "date-fns"
import { Activity, ActivityWithParticipants } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time utilities for Taipei time (UTC+8)
export const TAIWAN_TIMEZONE = 'Asia/Taipei';

// Get current time in Taipei timezone
export const getCurrentTaipeiTime = (): Date => {
  // Get current time in Taipei
  const now = new Date();
  const taipeiOffset = 8; // UTC+8
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * taipeiOffset));
};

// Format date to date string (YYYY-MM-DD)
export const formatTaipeiDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
};

// Format date to time string (HH:MM)
export const formatTaipeiTimeOnly = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Check if a date is in the past
export const isPastDate = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

// Check if a date is in the future
export const isFutureDate = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
};

// Add hours to a date
export const addHoursToTaipeiTime = (date: string | Date, hours: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  d.setHours(d.getHours() + hours);
  return d;
};

// Get time difference in minutes between two dates
export const getTimeDifferenceInMinutes = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60));
};

// Check if a date is before today
export const isBeforeTaipeiToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = startOfDay(new Date());
  return isBefore(d, today);
};

// Get start of day in Taipei timezone
export const startOfTaipeiDay = (date: Date): Date => {
  const d = new Date(date);
  const taipeiDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  taipeiDate.setHours(0, 0, 0, 0);
  return taipeiDate;
};

export function getLevelLabel(level: Level | null): string | null {
  if (!level) return null;
  const levelInfo = LEVELS.find(l => l.value === level);
  return levelInfo ? levelInfo.label : null;
}

// Helper function to find city by code
export function findCityByCode(cityCode?: string) {
  if (!cityCode) return null;
  return LOCATIONS.cities.find(c => c.code === cityCode);
}

// Helper function to find district by code
export function findDistrictByCode(cityCode?: string, districtCode?: string) {
  if (!cityCode || !districtCode) return null;
  const city = findCityByCode(cityCode);
  return city?.districts.find(d => d.code === districtCode);
}

// Format date/time to Taipei timezone
export function formatTaipeiTime(dateInput: string | Date, includeYear = false) {
  // Handle both string and Date inputs
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  // Check if date is valid after conversion
  if (isNaN(date.getTime())) {
    return "無效日期"; // Or return an empty string, or handle as needed
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Taipei',
    year: includeYear ? 'numeric' : undefined,
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  // Use 'zh-TW' for traditional Chinese format
  return new Intl.DateTimeFormat('zh-TW', options).format(date);
}

// --- New Utility Function --- 
/**
 * Calculates the appropriate badge properties (label, variant, className) 
 * for an activity based on its status (past, full, recruiting, etc.).
 */
export function getActivityBadgeStatus(activity: Activity | ActivityWithParticipants | null) {
  if (!activity) {
    // Default status if activity data is missing
    return { variant: "default" as const, label: "讀取中", className: "bg-gray-200 text-gray-500" };
  }

  // Check if the activity is in the past
  const isPast = new Date(activity.dateTime) < new Date();

  if (isPast) {
    return {
      variant: "default" as const,
      label: "已過期",
      // Use the same distinct grey style we defined earlier
      className: "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
    };
  }

  // Determine participant count (handle both Activity and ActivityWithParticipants)
  const participantsCount = ('participants' in activity)
    ? activity.participants.length
    : activity.currentParticipants || 0;

  const maxParticipants = activity.maxParticipants;

  // Status logic for non-past activities
  const isEmpty = participantsCount === 0;
  const isAlmostFull = participantsCount >= maxParticipants * 0.8;
  const isFull = participantsCount >= maxParticipants;

  if (isFull) return { variant: "destructive" as const, label: "已額滿", className: "" };
  if (isEmpty) return { variant: "outline" as const, label: "招募中", className: "" }; // Keep outline for empty but active
  if (isAlmostFull) return { variant: "secondary" as const, label: "即將額滿", className: "" };
  return { variant: "default" as const, label: "招募中", className: "" };
}


/**
 * 安全使用 localStorage，防止因禁用、隱私模式、Quota 滿等錯誤而爆炸
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error('safeLocalStorage.getItem failed:', e);
    }
    return null;
  },

  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('safeLocalStorage.setItem failed:', e);
    }
  },

  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('safeLocalStorage.removeItem failed:', e);
    }
  }
};

