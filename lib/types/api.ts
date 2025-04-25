import { Position, CityCode, DistrictCode } from '../constants';

export interface ApiError {
  code: string;
  message: string;
  timestamp?: string;
}

export interface ActivityCreate {
  title: string;
  description?: string | null;
  dateTime: string;
  duration: number;
  location: string;
  maxParticipants: number;
  amount: number;
  city: CityCode;
  district: DistrictCode;
}

export type ActivityUpdate = Partial<ActivityCreate>;

export interface ActivityJoinRequest {
  position: Position;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  city?: CityCode;
  district?: DistrictCode;
  title?: string;
  location?: string;
} 