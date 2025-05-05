export interface Sponsor {
  id: string;
  userId: string;
  name: string;
  contactEmail?: string;
  phone: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  isActive?: boolean;
  useLinePay?: boolean;
  linePayChannelId?: string;
  linePayChannelSecret?: string; // Note: Sensitive, consider backend handling
  linePayMode?: 'SANDBOX' | 'PRODUCTION';
  createdAt: string; // Assuming ISO string format from backend
  updatedAt: string; // Assuming ISO string format from backend
}

// For the form, matching SponsorUpdateRequest + id for update
export interface SponsorFormData {
  name: string;
  contactEmail?: string;
  phone: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  isActive?: boolean;
  useLinePay?: boolean;
  linePayChannelId?: string;
  linePayChannelSecret?: string;
  linePayMode?: 'SANDBOX' | 'PRODUCTION';
} 