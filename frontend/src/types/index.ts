export interface User {
  id: number;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface AdAccount {
  id: number;
  facebook_ad_account_id: string;
  name: string;
  currency: string;
  timezone: string;
  account_status: string;
}

export interface CampaignTemplate {
  id: number;
  name: string;
  description?: string;
  objective: string;
  campaign_config: any;
  adset_config: any;
  ad_config: any;
  is_default: boolean;
  created_at: string;
}

export interface UploadJob {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_ads: number;
  completed_ads: number;
  failed_ads: number;
  progress_percentage: number;
  campaign_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface Creative {
  id: number;
  filename: string;
  type: 'image' | 'video';
  aspect_ratio: string;
  variation_group?: string;
  variation_number?: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  thumbnail_url?: string;
  facebook_ad_id?: string;
}

export interface JobStats {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  processing_jobs: number;
  total_ads_created: number;
  successful_ads: number;
}

export interface VariationGroup {
  name: string;
  files: string[];
  count: number;
}

export interface TeamMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  invited_by: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: number;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
