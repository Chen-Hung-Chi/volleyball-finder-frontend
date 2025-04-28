"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { toast } from "react-toastify";

interface AddToGoogleCalendarButtonProps {
  title: string;
  description?: string | null;
  location: string;
  startTime: string;          // ISO 例：2024-05-01T10:00:00Z
  durationMinutes?: number;   // 預設 60 分鐘
}

/** 將 Date 轉成 Google Calendar 需要的 UTC 字串 yyyymmddThhmmssZ */
const toGCalString = (d: Date) => {
  if (isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
};

export const AddToGoogleCalendarButton = ({
  title,
  description,
  location,
  startTime,
  durationMinutes = 60,
}: AddToGoogleCalendarButtonProps) => {
  const openCalendar = () => {
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      toast.error("時間格式錯誤，無法加入日曆");
      return;
    }

    const end = new Date(start.getTime() + durationMinutes * 60_000);
    const startStr = toGCalString(start);
    const endStr   = toGCalString(end);

    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title || "排球活動");
    url.searchParams.set("dates", `${startStr}/${endStr}`);
    if (description) url.searchParams.set("details", description.slice(0, 500));
    if (location)    url.searchParams.set("location", location);

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const disabled = isNaN(new Date(startTime).getTime());

  return (
    <Button onClick={openCalendar} variant="outline" size="sm" disabled={disabled}>
      <CalendarPlus className="mr-2 h-4 w-4" />
      加入 Google 日曆
    </Button>
  );
};