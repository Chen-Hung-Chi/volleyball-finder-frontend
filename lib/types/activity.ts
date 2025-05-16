import { CityCode, DistrictCode, Position, Level, Role } from '../constants';
import type { PaginatedResponse, SearchParams } from './api';
import type { User } from './user';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  duration: number;
  location: string;
  city: CityCode;
  district: DistrictCode;
  maxParticipants: number;
  amount: number;
  currentParticipants: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isCaptain?: boolean;
  netType: 'MEN' | 'WOMEN' | 'MIXED';
  maleCount: number;
  femaleCount: number;
  maleQuota?: number;
  femaleQuota?: number;
  femalePriority?: boolean;
  requireVerification?: boolean;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  userId: string;
  user: User;
  isWaiting: boolean;
  isCaptain: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityParticipantDto {
  id: string;
  activityId: string;
  userId: string;
  isCaptain: boolean;
  createdAt: string;
  lineId?: string;
  realName?: string;
  nickname: string;
  gender?: 'MALE' | 'FEMALE' | null;
  position?: Position;
  level?: Level | null;
  volleyballAge?: number | null;
  avatar?: string;
  city?: CityCode;
  district?: DistrictCode;
  introduction?: string;
  userCreatedAt?: string;
  userUpdatedAt?: string;
  role?: Role;
}

export interface ActivityWithParticipants extends Activity {
  participants: ActivityParticipantDto[];
  waitingList: ActivityParticipantDto[];
  captain: User | null;
}

export interface ActivitySearchResponse extends PaginatedResponse<Activity> {
  items: (Activity & {
    currentParticipants: number;
  })[];
}

export interface ActivityFormData {
  title: string
  description: string
  dateTime: Date | null
  duration: number
  location: string
  maxParticipants: number
  amount: number
  city: string
  district: string
  netType: 'MEN' | 'WOMEN' | 'MIXED'
  maleQuota: number
  femaleQuota: number
  femalePriority: boolean
  maleCount: number
  femaleCount: number
  requireVerification: boolean
}

export interface ActivityFormProps {
  formData: ActivityFormData
  setFormData: React.Dispatch<React.SetStateAction<ActivityFormData>>
  isSubmitted: boolean
  setIsSubmitted: (value: boolean) => void
  date: Date | null
  setDate: (date: Date | null) => void
  time: string
  setTime: (time: string) => void
  titleRef: React.RefObject<HTMLInputElement>
  locationRef: React.RefObject<HTMLInputElement>
  amountRef: React.RefObject<HTMLInputElement>
}

export interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  initialValues: SearchParams;
}

export interface ActivityCardProps {
  activity: Activity;
}

export interface ActivityListProps {
  activities: Activity[];
}