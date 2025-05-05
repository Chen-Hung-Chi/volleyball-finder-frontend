import { Position, Level, CityCode, DistrictCode, Gender } from '../constants';
import type { Activity } from './activity';

export interface User {
  id: string;
  lineId: string;
  role: 'USER' | 'SPONSOR' | 'ADMIN';
  realName?: string;
  nickname: string;
  position?: Position;
  level: Level | null;
  volleyballAge?: number | null;
  avatar?: string;
  city?: CityCode;
  district?: DistrictCode;
  introduction?: string;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  createdActivities?: Activity[];
  joinedActivities?: Activity[];
  gender?: 'MALE' | 'FEMALE' | null;
}

export interface AuthResponse {
  user: User;
}

export interface UserCardProps {
  userId: string;
  nickname: string;
  avatar?: string;
  position?: Position;
  level?: Level | null;
  volleyballAge?: number | null;
  isCaptain?: boolean;
  isWaiting?: boolean;
  gender?: Gender | null;
  onClick?: () => void;
} 