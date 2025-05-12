// ──────────────────────────────────────────────────────────────
// src/lib/utils/index.ts   (移除所有 *Taipei* 時間函式版)
// ──────────────────────────────────────────────────────────────
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import dayjs from "dayjs"
import "dayjs/locale/zh-tw"           // 只影響 dayjs().format() 的中文顯示
dayjs.locale("zh-tw")

/* ------------------------------------------------------------------ */
/*  Tailwind className helper                                         */
/* ------------------------------------------------------------------ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ------------------------------------------------------------------ */
/*  其它 domain utils（城市 / 等級 / 活動 Badge）                      */
/* ------------------------------------------------------------------ */
import { LOCATIONS, Level, LEVELS } from "@/lib/constants"
import { Activity, ActivityWithParticipants } from "@/lib/types"

export function getLevelLabel(level: Level | null): string | null {
  if (!level) return null
  return LEVELS.find(l => l.value === level)?.label ?? null
}

export function findCityByCode(cityCode?: string) {
  return cityCode ? LOCATIONS.cities.find(c => c.code === cityCode) ?? null : null
}

export function findDistrictByCode(cityCode?: string, districtCode?: string) {
  if (!cityCode || !districtCode) return null
  return findCityByCode(cityCode)?.districts.find(d => d.code === districtCode) ?? null
}

/**
 * 依活動狀態產生 badge 屬性（仍用 dayjs 做簡單「過期」判斷，不含時區換算）
 */
export function getActivityBadgeStatus(
  activity: Activity | ActivityWithParticipants | null
) {
  if (!activity) {
    return {
      variant: "default" as const,
      label: "讀取中",
      className: "bg-gray-200 text-gray-500"
    }
  }

  if (dayjs(activity.dateTime).isBefore(dayjs())) {
    return {
      variant: "default" as const,
      label: "已過期",
      className: "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
    }
  }

  const participantsCount =
    "participants" in activity
      ? activity.participants.length
      : activity.currentParticipants ?? 0

  const { maxParticipants } = activity
  const isEmpty = participantsCount === 0
  const isAlmostFull = participantsCount >= maxParticipants * 0.8
  const isFull = participantsCount >= maxParticipants

  if (isFull) return { variant: "destructive" as const, label: "已額滿", className: "" }
  if (isEmpty) return { variant: "outline" as const, label: "招募中", className: "" }
  if (isAlmostFull) return { variant: "secondary" as const, label: "即將額滿", className: "" }
  return { variant: "default" as const, label: "招募中", className: "" }
}

/* ------------------------------------------------------------------ */
/*  安全 localStorage 包裝                                             */
/* ------------------------------------------------------------------ */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined") return localStorage.getItem(key)
    } catch (e) {
      console.error("safeLocalStorage.getItem failed:", e)
    }
    return null
  },

  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(key, value)
    } catch (e) {
      console.error("safeLocalStorage.setItem failed:", e)
    }
  },

  removeItem: (key: string) => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem(key)
    } catch (e) {
      console.error("safeLocalStorage.removeItem failed:", e)
    }
  }
}