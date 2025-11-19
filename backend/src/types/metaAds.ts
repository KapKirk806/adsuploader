/**
 * Meta Marketing API v22.0 (2025) Type Definitions
 * Comprehensive types for modern Meta Ads features including:
 * - Advantage+ campaigns
 * - Attribution windows
 * - Bid strategies
 * - Pixel integration
 * - Advanced targeting
 */

// ============================================================================
// Campaign Level Configuration
// ============================================================================

export type CampaignObjective =
  | 'OUTCOME_AWARENESS'        // Awareness (2025 unified objective)
  | 'OUTCOME_ENGAGEMENT'       // Engagement
  | 'OUTCOME_LEADS'            // Leads
  | 'OUTCOME_SALES'            // Sales (replaces CONVERSIONS)
  | 'OUTCOME_TRAFFIC'          // Traffic
  | 'OUTCOME_APP_PROMOTION';   // App Promotion

export type CampaignStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELETED'
  | 'ARCHIVED';

export type BidStrategy =
  | 'LOWEST_COST_WITHOUT_CAP'      // Default - Meta optimizes automatically
  | 'LOWEST_COST_WITH_BID_CAP'     // Bid cap
  | 'COST_CAP'                      // Cost cap (CPA target)
  | 'LOWEST_COST_WITH_MIN_ROAS';   // Min ROAS target

export type BuyingType =
  | 'AUCTION'
  | 'RESERVED';

/**
 * Campaign Budget Optimization settings
 * Advantage+ Campaign Budget (replaces CBO)
 */
export interface CampaignBudgetOptimization {
  enabled: boolean;
  // Spend limit across all ad sets in campaign
  budget_optimization_type?: 'AUTOMATIC' | 'MANUAL';
}

/**
 * Campaign Special Ad Categories (for compliance)
 */
export type SpecialAdCategory =
  | 'NONE'
  | 'EMPLOYMENT'
  | 'HOUSING'
  | 'CREDIT'
  | 'ISSUES_ELECTIONS_POLITICS';

export interface CampaignConfig {
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  buying_type: BuyingType;

  // Special ad categories for compliance
  special_ad_categories: SpecialAdCategory[];

  // Campaign Budget Optimization (Advantage+)
  campaign_budget_optimization?: CampaignBudgetOptimization;

  // Advantage+ Campaign settings
  advantage_campaign_budget?: {
    enabled: boolean;
  };

  // Campaign spending limit
  daily_budget?: number;        // In cents (e.g., 5000 = $50)
  lifetime_budget?: number;     // In cents

  // Campaign schedule
  start_time?: string;          // ISO 8601 format
  end_time?: string;            // ISO 8601 format

  // Bid strategy
  bid_strategy: BidStrategy;
}

// ============================================================================
// Ad Set Level Configuration
// ============================================================================

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
  | 'OFFSITE_CONVERSIONS'        // Standard conversions
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'QUALITY_CALL'
  | 'REACH'
  | 'LANDING_PAGE_VIEWS'
  | 'VISIT_INSTAGRAM_PROFILE'
  | 'VALUE'                       // Purchase value optimization
  | 'THRUPLAY'                    // Video views
  | 'CONVERSATIONS';              // Messaging

export type BillingEvent =
  | 'APP_INSTALLS'
  | 'CLICKS'
  | 'IMPRESSIONS'
  | 'LINK_CLICKS'
  | 'NONE'
  | 'OFFER_CLAIMS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'THRUPLAY'
  | 'PURCHASE'
  | 'LISTING_INTERACTION';

/**
 * Attribution Windows (2025 update)
 * Note: View-through attribution being deprecated in 2026
 */
export type AttributionWindow =
  | '1d_click'          // 1-day click attribution
  | '7d_click'          // 7-day click attribution (recommended default)
  | '1d_view'           // 1-day view attribution (being deprecated)
  | '7d_view';          // 7-day view attribution (being deprecated)

export interface AttributionSpec {
  // Attribution windows for different event types
  click_window: '1d_click' | '7d_click';
  view_window?: '1d_view' | '7d_view';  // Optional, being deprecated
}

/**
 * Meta Pixel Configuration
 */
export interface PixelConfig {
  // Meta Pixel ID
  pixel_id: string;

  // Custom conversion event
  custom_event_type?: string;

  // Standard events: Purchase, Lead, CompleteRegistration, AddToCart, etc.
  standard_event?: string;

  // Conversions API integration
  capi_integration?: {
    enabled: boolean;
    access_token?: string;
  };
}

/**
 * Targeting - Geographic
 */
export interface GeoLocation {
  countries?: string[];              // ISO 2-letter codes: ['US', 'CA', 'GB']
  regions?: Array<{
    key: string;                     // Region ID
    name?: string;
  }>;
  cities?: Array<{
    key: string;                     // City ID
    radius?: number;                 // Miles
    distance_unit?: 'mile' | 'kilometer';
  }>;
  zips?: Array<{
    key: string;                     // ZIP code
  }>;

  // Location types
  location_types?: Array<
    | 'home'                         // People who live in this location
    | 'recent'                       // People recently in this location
    | 'travel_in'                    // People traveling to this location
  >;
}

/**
 * Targeting - Demographics
 */
export interface Demographics {
  age_min: number;                   // 13-65
  age_max: number;                   // 13-65
  genders?: Array<1 | 2>;            // 1 = male, 2 = female

  // Locales (languages)
  locales?: number[];                // Locale IDs

  // Relationship status
  relationship_statuses?: Array<
    | 1    // Single
    | 2    // In relationship
    | 3    // Married
    | 4    // Engaged
  >;

  // Interested in (for dating ads)
  interested_in?: Array<1 | 2 | 3 | 4>;

  // Education
  education_statuses?: Array<
    | 1    // High school
    | 2    // Some college
    | 3    // Associate degree
    | 4    // In college
    | 5    // College graduate
    | 6    // Some graduate school
    | 7    // In graduate school
    | 8    // Master's degree
    | 9    // Professional degree
    | 10   // Doctorate degree
  >;

  // Life events
  life_events?: Array<{
    id: string;
    name?: string;
  }>;

  // Work
  work_positions?: Array<{
    id: string;
    name?: string;
  }>;

  work_employers?: Array<{
    id: string;
    name?: string;
  }>;
}

/**
 * Targeting - Interests
 */
export interface Interest {
  id: string;
  name?: string;
}

/**
 * Targeting - Behaviors
 */
export interface Behavior {
  id: string;
  name?: string;
}

/**
 * Custom Audiences
 */
export interface CustomAudience {
  id: string;
  name?: string;
}

/**
 * Lookalike Audiences
 */
export interface LookalikeAudience {
  id: string;
  name?: string;
  ratio?: number;                    // 1-10% similarity
}

/**
 * Flexible Spec for detailed targeting
 */
export interface FlexibleSpec {
  interests?: Interest[];
  behaviors?: Behavior[];
  life_events?: Array<{
    id: string;
    name?: string;
  }>;
  industries?: Array<{
    id: string;
    name?: string;
  }>;
  income?: Array<{
    id: string;
    name?: string;
  }>;
  family_statuses?: Array<{
    id: string;
    name?: string;
  }>;
  user_os?: string[];               // Operating systems
  user_device?: string[];           // Device types
}

/**
 * Advantage+ Audience (2025)
 * Replaces traditional detailed targeting
 */
export interface AdvantageAudience {
  enabled: boolean;

  // Audience suggestions (optional constraints)
  age_min?: number;
  age_max?: number;
  genders?: Array<1 | 2>;
  geo_locations?: GeoLocation;

  // Advantage+ will expand beyond these suggestions
  targeting_expansion?: 'AUTOMATIC' | 'DISABLED';
}

/**
 * Targeting Configuration
 */
export interface Targeting {
  // Basic demographics (always required)
  age_min: number;
  age_max: number;
  genders?: Array<1 | 2>;

  // Geographic targeting
  geo_locations: GeoLocation;

  // Advantage+ Audience (recommended for 2025)
  advantage_audience?: AdvantageAudience;

  // Traditional detailed targeting (legacy)
  flexible_spec?: FlexibleSpec[];

  // Exclusions
  exclusions?: {
    interests?: Interest[];
    behaviors?: Behavior[];
    custom_audiences?: CustomAudience[];
  };

  // Custom and Lookalike audiences
  custom_audiences?: CustomAudience[];
  lookalike_audiences?: LookalikeAudience[];

  // Device targeting
  device_platforms?: Array<'mobile' | 'desktop'>;
  publisher_platforms?: Array<'facebook' | 'instagram' | 'messenger' | 'audience_network'>;
  facebook_positions?: string[];
  instagram_positions?: string[];
  messenger_positions?: string[];
  audience_network_positions?: string[];

  // Targeting optimization
  targeting_optimization?: 'EXPANSION_ALL' | 'NONE';

  // Connections targeting
  connections?: {
    page?: string[];                  // Target page fans
    app?: string[];                   // Target app users
    event?: string[];                 // Target event attendees
  };

  excluded_connections?: {
    page?: string[];
    app?: string[];
    event?: string[];
  };
}

/**
 * Placements Configuration
 */
export type PlacementType =
  // Facebook
  | 'feed'                           // Facebook Feed
  | 'right_hand_column'              // Facebook right column
  | 'instant_article'                // Facebook Instant Articles
  | 'marketplace'                    // Facebook Marketplace
  | 'video_feeds'                    // Facebook Video Feeds
  | 'story'                          // Facebook Stories
  | 'search'                         // Facebook Search
  | 'instream_video'                 // Facebook In-Stream Video
  | 'reels'                          // Facebook Reels (NEW 2024)
  | 'facebook_reels_overlay'         // Facebook Reels Overlay

  // Instagram
  | 'instagram_stream'               // Instagram Feed
  | 'instagram_story'                // Instagram Stories
  | 'instagram_explore'              // Instagram Explore
  | 'instagram_reels'                // Instagram Reels
  | 'instagram_profile_feed'         // Instagram Profile Feed
  | 'instagram_search'               // Instagram Search
  | 'instagram_shop'                 // Instagram Shops

  // Messenger
  | 'messenger_inbox'                // Messenger Inbox
  | 'messenger_story'                // Messenger Stories

  // Audience Network
  | 'audience_network_classic'       // AN Classic
  | 'audience_network_instream_video'// AN In-Stream Video
  | 'audience_network_rewarded_video';// AN Rewarded Video

export interface PlacementConfig {
  // Advantage+ Placements (recommended for 2025)
  advantage_placements?: {
    enabled: boolean;                 // Use automatic placements
  };

  // Manual placement selection
  publisher_platforms?: Array<'facebook' | 'instagram' | 'messenger' | 'audience_network'>;

  // Specific placements per platform
  facebook_positions?: PlacementType[];
  instagram_positions?: PlacementType[];
  messenger_positions?: PlacementType[];
  audience_network_positions?: PlacementType[];

  // Placement asset customization
  asset_customization_rules?: Array<{
    placement: PlacementType;
    customization_spec: {
      body?: string;
      link_description?: string;
      caption?: string;
    };
  }>;
}

/**
 * Ad Set Configuration (Complete)
 */
export interface AdSetConfig {
  name: string;
  status: CampaignStatus;

  // Optimization and delivery
  optimization_goal: OptimizationGoal;
  billing_event: BillingEvent;
  bid_amount?: number;                // In cents

  // Budget (if not using campaign budget optimization)
  daily_budget?: number;              // In cents
  lifetime_budget?: number;           // In cents

  // Schedule
  start_time?: string;
  end_time?: string;

  // Attribution
  attribution_spec: AttributionSpec;

  // Pixel configuration
  pixel_config?: PixelConfig;

  // Promoted object (what you're promoting)
  promoted_object?: {
    pixel_id?: string;
    custom_event_type?: string;
    page_id?: string;
    application_id?: string;
    object_store_url?: string;
    product_set_id?: string;
  };

  // Targeting
  targeting: Targeting;

  // Placements
  placements: PlacementConfig;

  // Delivery settings
  pacing_type?: Array<'standard' | 'day_parting'>;
  delivery_behavior?: 'STANDARD' | 'ACCELERATED';

  // Frequency cap
  frequency_cap?: {
    interval_days: number;
    max_impressions: number;
  };
}

// ============================================================================
// Ad Creative Level Configuration
// ============================================================================

export type CallToActionType =
  | 'OPEN_LINK'
  | 'LIKE_PAGE'
  | 'SHOP_NOW'
  | 'PLAY_GAME'
  | 'INSTALL_APP'
  | 'USE_APP'
  | 'CALL'
  | 'CALL_ME'
  | 'INSTALL_MOBILE_APP'
  | 'USE_MOBILE_APP'
  | 'MOBILE_DOWNLOAD'
  | 'BOOK_TRAVEL'
  | 'LISTEN_MUSIC'
  | 'LEARN_MORE'
  | 'SIGN_UP'
  | 'DOWNLOAD'
  | 'WATCH_MORE'
  | 'NO_BUTTON'
  | 'VISIT_PAGES_FEED'
  | 'APPLY_NOW'
  | 'BUY_NOW'
  | 'GET_OFFER'
  | 'GET_OFFER_VIEW'
  | 'BUY_TICKETS'
  | 'UPDATE_APP'
  | 'GET_DIRECTIONS'
  | 'BUY'
  | 'MESSAGE_PAGE'
  | 'DONATE'
  | 'SUBSCRIBE'
  | 'SAY_THANKS'
  | 'SELL_NOW'
  | 'SHARE'
  | 'DONATE_NOW'
  | 'GET_QUOTE'
  | 'CONTACT_US'
  | 'ORDER_NOW'
  | 'ADD_TO_CART'
  | 'VIDEO_ANNOTATION'
  | 'MOMENTS'
  | 'RECORD_NOW'
  | 'VOTE_NOW'
  | 'REGISTER_NOW'
  | 'OPEN_INSTANT_APP'
  | 'WHATSAPP_MESSAGE'
  | 'FOLLOW_NEWS_STORYLINE'
  | 'SEE_MORE';

/**
 * Advantage+ Creative (2025)
 * Individual enhancement toggles (v22.0 update)
 */
export interface AdvantageCreative {
  // Standard enhancements (individual opt-ins as of v22.0)
  image_enhancements?: {
    enabled: boolean;
    brightness_adjustment?: boolean;
    contrast_adjustment?: boolean;
    cropping?: boolean;
  };

  // Video enhancements
  video_enhancements?: {
    enabled: boolean;
    auto_enhance?: boolean;
  };

  // Text optimization
  text_optimization?: {
    enabled: boolean;
    variations?: string[];           // Alternative text variations
  };

  // Dynamic creative optimization
  dynamic_creative?: {
    enabled: boolean;
  };

  // Catalog enhancements
  catalog_enhancements?: {
    enabled: boolean;
    dynamic_media?: boolean;         // Default OPT_IN as of Sept 2025
  };
}

/**
 * Ad Creative Configuration
 */
export interface AdCreativeConfig {
  name: string;

  // Creative type
  object_type?: 'SHARE' | 'PHOTO' | 'VIDEO' | 'CAROUSEL';

  // Ad format
  call_to_action?: {
    type: CallToActionType;
    value?: {
      link?: string;
      app_link?: string;
      application?: string;
    };
  };

  // Creative content
  title?: string;
  body?: string;
  link_url?: string;
  link_description?: string;

  // Media
  image_hash?: string;
  image_url?: string;
  video_id?: string;

  // Page/App info
  page_id?: string;
  instagram_actor_id?: string;

  // Advantage+ Creative (2025)
  advantage_creative?: AdvantageCreative;

  // Asset feed spec (for dynamic ads)
  asset_feed_spec?: {
    images?: Array<{
      hash: string;
      url?: string;
    }>;
    videos?: Array<{
      video_id: string;
      thumbnail_url?: string;
    }>;
    bodies?: Array<{
      text: string;
    }>;
    titles?: Array<{
      text: string;
    }>;
    descriptions?: Array<{
      text: string;
    }>;
    ad_formats?: Array<'AUTOMATIC_FORMAT' | 'SINGLE_IMAGE' | 'SINGLE_VIDEO' | 'CAROUSEL'>;
  };
}

/**
 * Ad Configuration
 */
export interface AdConfig {
  name: string;
  status: CampaignStatus;
  creative: AdCreativeConfig;
}

// ============================================================================
// Complete Campaign Template
// ============================================================================

export interface CampaignTemplate {
  id?: number;
  user_id: number;
  name: string;
  description?: string;
  objective: CampaignObjective;

  // Configuration objects
  campaign_config: CampaignConfig;
  adset_config: AdSetConfig;
  ad_config: AdConfig;

  is_default: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================================================
// Helper Types and Enums
// ============================================================================

/**
 * Meta Ads API Error Response
 */
export interface MetaAPIError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * Validation helpers
 */
export const VALID_AGE_RANGE = { min: 13, max: 65 };
export const VALID_BID_STRATEGIES: BidStrategy[] = [
  'LOWEST_COST_WITHOUT_CAP',
  'LOWEST_COST_WITH_BID_CAP',
  'COST_CAP',
  'LOWEST_COST_WITH_MIN_ROAS'
];
export const RECOMMENDED_ATTRIBUTION_WINDOW: AttributionWindow = '7d_click';
export const DEPRECATED_ATTRIBUTION_WINDOWS: AttributionWindow[] = ['1d_view', '7d_view'];
