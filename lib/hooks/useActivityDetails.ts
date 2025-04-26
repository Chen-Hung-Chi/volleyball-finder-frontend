import { useMemo } from 'react';
import { ActivityWithParticipants, User } from '@/lib/types';
import { NET_TYPES, LOCATIONS } from '@/lib/constants';
import { getActivityBadgeStatus } from '@/lib/utils';

// Define the expected shape for the status object
interface ActivityStatus {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | null | undefined;
  className?: string;
}

export const useActivityDetails = (activity: ActivityWithParticipants | null, user: User | null) => {
  return useMemo(() => {
    const defaultStatus: ActivityStatus = { label: '未知', variant: 'secondary', className: '' };

    if (!activity) {
      // Return default/empty values if no activity
      return {
        isParticipant: false,
        isCreator: false,
        isPastActivity: false,
        netTypeLabel: '未設定',
        status: defaultStatus, // Use defined default
        isFullWithWaitingList: false,
        locationString: '',
      };
    }

    // --- Calculations (moved from component) ---
    const isParticipant = activity.participants.some(p => p.userId === user?.id);
    const isCreator = user?.id === activity.createdBy;
    const isPastActivity = new Date(activity.dateTime) < new Date();
    const netTypeLabel = NET_TYPES.find(type => type.value === activity.netType)?.label || '未設定';
    const status = getActivityBadgeStatus(activity); // Type is inferred from function return
    const isFullWithWaitingList = activity.participants.length >= (activity.maxParticipants + 10); // Assuming +10 for waiting list
    const locationString = `${LOCATIONS.cities.find(city => city.code === activity.city)?.name} ${LOCATIONS.cities.find(city => city.code === activity.city)?.districts.find(d => d.code === activity.district)?.name} - ${activity.location}`;

    return {
      isParticipant,
      isCreator,
      isPastActivity,
      netTypeLabel,
      status,
      isFullWithWaitingList,
      locationString,
    };
  // Recalculate whenever activity or user changes
  }, [activity, user]);
}; 