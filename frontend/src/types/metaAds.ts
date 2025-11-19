/**
 * Frontend Meta Ads Types (November 2025)
 * TypeScript types for Meta Marketing API v22.0 features
 */

// Campaign Level
export type CampaignObjective =
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_APP_PROMOTION';

export type BidStrategy =
  | 'LOWEST_COST_WITHOUT_CAP'
  | 'LOWEST_COST_WITH_BID_CAP'
  | 'COST_CAP'
  | 'LOWEST_COST_WITH_MIN_ROAS';

export type SpecialAdCategory =
  | 'NONE'
  | 'EMPLOYMENT'
  | 'HOUSING'
  | 'CREDIT'
  | 'ISSUES_ELECTIONS_POLITICS';

export interface CampaignConfig {
  name: string;
  objective: CampaignObjective;
  status: 'ACTIVE' | 'PAUSED';
  buying_type: 'AUCTION' | 'RESERVED';
  special_ad_categories: SpecialAdCategory[];
  campaign_budget_optimization?: {
    enabled: boolean;
  };
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  bid_strategy: BidStrategy;
}

// Ad Set Level
export type OptimizationGoal =
  | 'NONE'
  | 'APP_INSTALLS'
  | 'AD_RECALL_LIFT'
  | 'ENGAGED_USERS'
  | 'EVENT_RESPONSES'
  | 'IMPRESSIONS'
  | 'LEAD_GENERATION'
  | 'QUALITY_LEAD'
  | 'LINK_CLICKS'
  | 'OFFSITE_CONVERSIONS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'REACH'
  | 'LANDING_PAGE_VIEWS'
  | 'VALUE'
  | 'THRUPLAY'
  | 'CONVERSATIONS';

export type BillingEvent =
  | 'IMPRESSIONS'
  | 'LINK_CLICKS'
  | 'THRUPLAY'
  | 'PURCHASE';

export type AttributionWindow = '1d_click' | '7d_click' | '1d_view' | '7d_view';

export interface AttributionSpec {
  click_window: '1d_click' | '7d_click';
  view_window?: '1d_view' | '7d_view';
}

export interface PixelConfig {
  pixel_id: string;
  custom_event_type?: string;
  standard_event?: string;
  capi_integration?: {
    enabled: boolean;
    access_token?: string;
  };
}

export interface GeoLocation {
  countries?: string[];
  regions?: Array<{ key: string; name?: string }>;
  cities?: Array<{
    key: string;
    radius?: number;
    distance_unit?: 'mile' | 'kilometer';
  }>;
  zips?: Array<{ key: string }>;
  location_types?: Array<'home' | 'recent' | 'travel_in'>;
}

export interface Demographics {
  age_min: number;
  age_max: number;
  genders?: Array<1 | 2>;
  locales?: number[];
}

export interface Interest {
  id: string;
  name?: string;
}

export interface Behavior {
  id: string;
  name?: string;
}

export interface CustomAudience {
  id: string;
  name?: string;
}

export interface LookalikeAudience {
  id: string;
  name?: string;
  ratio?: number;
}

export interface AdvantageAudience {
  enabled: boolean;
  age_min?: number;
  age_max?: number;
  genders?: Array<1 | 2>;
  geo_locations?: GeoLocation;
  targeting_expansion?: 'AUTOMATIC' | 'DISABLED';
}

export interface FlexibleSpec {
  interests?: Interest[];
  behaviors?: Behavior[];
}

export interface Targeting {
  age_min: number;
  age_max: number;
  genders?: Array<1 | 2>;
  geo_locations: GeoLocation;
  advantage_audience?: AdvantageAudience;
  flexible_spec?: FlexibleSpec[];
  exclusions?: {
    interests?: Interest[];
    behaviors?: Behavior[];
    custom_audiences?: CustomAudience[];
  };
  custom_audiences?: CustomAudience[];
  lookalike_audiences?: LookalikeAudience[];
  device_platforms?: Array<'mobile' | 'desktop'>;
  publisher_platforms?: Array<'facebook' | 'instagram' | 'messenger' | 'audience_network'>;
  targeting_optimization?: 'EXPANSION_ALL' | 'NONE';
}

export type PlacementType =
  | 'feed'
  | 'story'
  | 'reels'
  | 'instagram_stream'
  | 'instagram_story'
  | 'instagram_reels'
  | 'instagram_explore'
  | 'instagram_shop'
  | 'messenger_inbox'
  | 'messenger_story'
  | 'marketplace'
  | 'video_feeds'
  | 'search';

export interface PlacementConfig {
  advantage_placements?: {
    enabled: boolean;
  };
  publisher_platforms?: Array<'facebook' | 'instagram' | 'messenger' | 'audience_network'>;
  facebook_positions?: PlacementType[];
  instagram_positions?: PlacementType[];
  messenger_positions?: PlacementType[];
  audience_network_positions?: PlacementType[];
}

export interface AdSetConfig {
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  optimization_goal: OptimizationGoal;
  billing_event: BillingEvent;
  bid_amount?: number;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  attribution_spec: AttributionSpec;
  pixel_config?: PixelConfig;
  promoted_object?: {
    pixel_id?: string;
    custom_event_type?: string;
    page_id?: string;
  };
  targeting: Targeting;
  placements: PlacementConfig;
  frequency_cap?: {
    interval_days: number;
    max_impressions: number;
  };
}

// Creative Level
export type CallToActionType =
  | 'SHOP_NOW'
  | 'LEARN_MORE'
  | 'SIGN_UP'
  | 'DOWNLOAD'
  | 'BUY_NOW'
  | 'GET_OFFER'
  | 'APPLY_NOW'
  | 'BOOK_TRAVEL'
  | 'CONTACT_US'
  | 'DONATE_NOW'
  | 'GET_QUOTE'
  | 'ORDER_NOW'
  | 'ADD_TO_CART'
  | 'WATCH_MORE'
  | 'NO_BUTTON';

export interface AdvantageCreative {
  image_enhancements?: {
    enabled: boolean;
    brightness_adjustment?: boolean;
    contrast_adjustment?: boolean;
    cropping?: boolean;
  };
  video_enhancements?: {
    enabled: boolean;
    auto_enhance?: boolean;
  };
  text_optimization?: {
    enabled: boolean;
    variations?: string[];
  };
  dynamic_creative?: {
    enabled: boolean;
  };
}

export interface AdCreativeConfig {
  name: string;
  call_to_action?: {
    type: CallToActionType;
    value?: {
      link?: string;
    };
  };
  title?: string;
  body?: string;
  link_url?: string;
  link_description?: string;
  advantage_creative?: AdvantageCreative;
}

export interface AdConfig {
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  creative: AdCreativeConfig;
}

// Complete Template
export interface CampaignTemplate {
  id?: number;
  user_id?: number;
  name: string;
  description?: string;
  objective: CampaignObjective;
  campaign_config: CampaignConfig;
  adset_config: AdSetConfig;
  ad_config: AdConfig;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// Constants for dropdown options
export const CAMPAIGN_OBJECTIVES: Array<{ value: CampaignObjective; label: string; description: string }> = [
  { value: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Reach people and build awareness' },
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Send people to a destination' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement', description: 'Get more messages, video views, post engagement' },
  { value: 'OUTCOME_LEADS', label: 'Leads', description: 'Collect leads for your business' },
  { value: 'OUTCOME_SALES', label: 'Sales', description: 'Find people likely to purchase' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion', description: 'Get more app installs or actions' },
];

export const BID_STRATEGIES: Array<{ value: BidStrategy; label: string; description: string }> = [
  { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Lowest Cost (Recommended)', description: 'Meta optimizes bids automatically' },
  { value: 'COST_CAP', label: 'Cost Cap', description: 'Set a target cost per action' },
  { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Bid Cap', description: 'Set maximum bid amount' },
  { value: 'LOWEST_COST_WITH_MIN_ROAS', label: 'Min ROAS', description: 'Set minimum return on ad spend' },
];

export const OPTIMIZATION_GOALS: Array<{ value: OptimizationGoal; label: string }> = [
  { value: 'REACH', label: 'Reach' },
  { value: 'IMPRESSIONS', label: 'Impressions' },
  { value: 'LINK_CLICKS', label: 'Link Clicks' },
  { value: 'LANDING_PAGE_VIEWS', label: 'Landing Page Views' },
  { value: 'OFFSITE_CONVERSIONS', label: 'Conversions' },
  { value: 'VALUE', label: 'Value (Purchase Value)' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'QUALITY_LEAD', label: 'Quality Leads' },
  { value: 'POST_ENGAGEMENT', label: 'Post Engagement' },
  { value: 'PAGE_LIKES', label: 'Page Likes' },
  { value: 'THRUPLAY', label: 'ThruPlay (Video Views)' },
  { value: 'APP_INSTALLS', label: 'App Installs' },
];

export const SPECIAL_AD_CATEGORIES: Array<{ value: SpecialAdCategory; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'ISSUES_ELECTIONS_POLITICS', label: 'Issues, Elections, or Politics' },
];

export const CALL_TO_ACTIONS: Array<{ value: CallToActionType; label: string }> = [
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'BUY_NOW', label: 'Buy Now' },
  { value: 'GET_OFFER', label: 'Get Offer' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'BOOK_TRAVEL', label: 'Book Travel' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'DONATE_NOW', label: 'Donate Now' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'ORDER_NOW', label: 'Order Now' },
  { value: 'ADD_TO_CART', label: 'Add to Cart' },
  { value: 'WATCH_MORE', label: 'Watch More' },
  { value: 'NO_BUTTON', label: 'No Button' },
];

export const FACEBOOK_PLACEMENTS: Array<{ value: PlacementType; label: string }> = [
  { value: 'feed', label: 'Facebook Feed' },
  { value: 'story', label: 'Facebook Stories' },
  { value: 'reels', label: 'Facebook Reels' },
  { value: 'video_feeds', label: 'Facebook Video Feeds' },
  { value: 'marketplace', label: 'Facebook Marketplace' },
  { value: 'search', label: 'Facebook Search' },
];

export const INSTAGRAM_PLACEMENTS: Array<{ value: PlacementType; label: string }> = [
  { value: 'instagram_stream', label: 'Instagram Feed' },
  { value: 'instagram_story', label: 'Instagram Stories' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'instagram_explore', label: 'Instagram Explore' },
  { value: 'instagram_shop', label: 'Instagram Shop' },
];

export const MESSENGER_PLACEMENTS: Array<{ value: PlacementType; label: string }> = [
  { value: 'messenger_inbox', label: 'Messenger Inbox' },
  { value: 'messenger_story', label: 'Messenger Stories' },
];
