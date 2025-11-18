import { Request } from 'express';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: User;
}

// User types
export interface User {
  id: number;
  facebook_id?: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  facebook_id?: string;
  email: string;
  name?: string;
  avatar_url?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
}

// Ad Account types
export interface AdAccount {
  id: number;
  user_id: number;
  facebook_ad_account_id: string;
  name: string;
  currency: string;
  timezone: string;
  account_status: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Campaign Template types
export interface CampaignTemplate {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  objective: string;
  campaign_config: CampaignConfig;
  adset_config: AdSetConfig;
  ad_config: AdConfig;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignConfig {
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED';
  special_ad_categories?: string[];
  buying_type?: string;
}

export interface AdSetConfig {
  name: string;
  optimization_goal: string;
  billing_event: string;
  bid_amount?: number;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  targeting: Targeting;
  status: 'ACTIVE' | 'PAUSED';
}

export interface Targeting {
  geo_locations?: {
    countries?: string[];
    cities?: any[];
    regions?: any[];
  };
  age_min?: number;
  age_max?: number;
  genders?: number[];
  interests?: any[];
  behaviors?: any[];
  custom_audiences?: string[];
  excluded_custom_audiences?: string[];
}

export interface AdConfig {
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  creative: AdCreativeConfig;
}

export interface AdCreativeConfig {
  name: string;
  object_story_spec: {
    page_id: string;
    link_data?: {
      link: string;
      message: string;
      name?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link: string;
        };
      };
    };
    video_data?: {
      video_id: string;
      message: string;
      title?: string;
      call_to_action?: {
        type: string;
        value?: {
          link: string;
        };
      };
    };
  };
}

// Upload Job types
export interface UploadJob {
  id: number;
  user_id: number;
  ad_account_id: number;
  template_id?: number;
  job_type: 'bulk_upload' | 'single_upload';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_ads: number;
  completed_ads: number;
  failed_ads: number;
  error_log?: any;
  campaign_id?: string;
  adset_id?: string;
  progress_percentage: number;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface CreateJobDTO {
  user_id: number;
  ad_account_id: number;
  template_id?: number;
  job_type?: 'bulk_upload' | 'single_upload';
  total_ads: number;
}

// Creative types
export interface Creative {
  id: number;
  upload_job_id: number;
  user_id: number;
  file_name: string;
  original_file_name: string;
  file_type: 'image' | 'video';
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  facebook_creative_id?: string;
  facebook_ad_id?: string;
  aspect_ratio: string;
  width: number;
  height: number;
  duration?: number;
  variation_group?: string;
  variation_number?: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error_message?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCreativeDTO {
  upload_job_id: number;
  user_id: number;
  file_name: string;
  original_file_name: string;
  file_type: 'image' | 'video';
  file_size: number;
  file_url: string;
  width: number;
  height: number;
  aspect_ratio: string;
  duration?: number;
  variation_group?: string;
  variation_number?: number;
}

// Meta API Response types
export interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id: string;
}

export interface MetaCampaignResponse {
  id: string;
  name: string;
  status: string;
}

export interface MetaAdSetResponse {
  id: string;
  name: string;
  status: string;
}

export interface MetaAdResponse {
  id: string;
  name: string;
  status: string;
}

export interface MetaImageUploadResponse {
  images: {
    [filename: string]: {
      hash: string;
      url?: string;
    };
  };
}

export interface MetaVideoUploadResponse {
  id: string;
  title?: string;
}

// Google Drive types
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  thumbnailLink?: string;
  webContentLink?: string;
  modifiedTime: string;
}

export interface GoogleDriveConnection {
  id: number;
  user_id: number;
  access_token: string;
  refresh_token: string;
  token_expires_at: Date;
  email: string;
  is_active: boolean;
}
