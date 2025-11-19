/**
 * Meta Ads Configuration Validation
 * Validates campaign, ad set, and ad configurations according to Meta Marketing API v22.0 (2025)
 */

import {
  CampaignConfig,
  AdSetConfig,
  AdConfig,
  CampaignObjective,
  BidStrategy,
  OptimizationGoal,
  AttributionWindow,
  VALID_AGE_RANGE,
  VALID_BID_STRATEGIES,
  DEPRECATED_ATTRIBUTION_WINDOWS,
} from '../types/metaAds';

export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Validate Campaign Configuration
 */
export function validateCampaignConfig(config: Partial<CampaignConfig>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Campaign name is required');
  }

  if (config.name && config.name.length > 255) {
    errors.push('Campaign name must be 255 characters or less');
  }

  if (!config.objective) {
    errors.push('Campaign objective is required');
  }

  if (!config.bid_strategy) {
    errors.push('Bid strategy is required');
  } else if (!VALID_BID_STRATEGIES.includes(config.bid_strategy)) {
    errors.push(`Invalid bid strategy. Must be one of: ${VALID_BID_STRATEGIES.join(', ')}`);
  }

  // Budget validation
  if (config.daily_budget && config.lifetime_budget) {
    errors.push('Cannot set both daily_budget and lifetime_budget. Choose one.');
  }

  if (!config.daily_budget && !config.lifetime_budget) {
    errors.push('Either daily_budget or lifetime_budget is required');
  }

  if (config.daily_budget && config.daily_budget < 100) {
    errors.push('Daily budget must be at least $1.00 (100 cents)');
  }

  if (config.lifetime_budget && config.lifetime_budget < 100) {
    errors.push('Lifetime budget must be at least $1.00 (100 cents)');
  }

  // If lifetime budget is set, end_time must be set
  if (config.lifetime_budget && !config.end_time) {
    errors.push('end_time is required when using lifetime_budget');
  }

  // Validate dates
  if (config.start_time && config.end_time) {
    const start = new Date(config.start_time);
    const end = new Date(config.end_time);

    if (end <= start) {
      errors.push('end_time must be after start_time');
    }
  }

  // Validate special ad categories
  if (config.special_ad_categories && config.special_ad_categories.length > 0) {
    // If special categories are set, certain restrictions apply
    const hasSpecialCategory = config.special_ad_categories.some(cat => cat !== 'NONE');
    if (hasSpecialCategory) {
      // Special ad categories have limited targeting options
      // This will be validated in ad set targeting
    }
  }

  return errors;
}

/**
 * Validate Ad Set Configuration
 */
export function validateAdSetConfig(config: Partial<AdSetConfig>, campaignConfig: Partial<CampaignConfig>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Ad set name is required');
  }

  if (!config.optimization_goal) {
    errors.push('Optimization goal is required');
  }

  if (!config.billing_event) {
    errors.push('Billing event is required');
  }

  // Budget validation (if not using campaign budget optimization)
  if (!campaignConfig.campaign_budget_optimization?.enabled) {
    if (!config.daily_budget && !config.lifetime_budget) {
      errors.push('Either daily_budget or lifetime_budget is required when not using campaign budget optimization');
    }

    if (config.daily_budget && config.daily_budget < 100) {
      errors.push('Ad set daily budget must be at least $1.00 (100 cents)');
    }

    if (config.lifetime_budget && config.lifetime_budget < 100) {
      errors.push('Ad set lifetime budget must be at least $1.00 (100 cents)');
    }
  }

  // Bid amount validation
  if (config.bid_amount !== undefined) {
    if (config.bid_amount < 1) {
      errors.push('Bid amount must be at least 1 cent');
    }

    // Check if bid strategy allows bid amount
    if (campaignConfig.bid_strategy === 'LOWEST_COST_WITHOUT_CAP') {
      errors.push('Cannot set bid_amount with LOWEST_COST_WITHOUT_CAP bid strategy');
    }
  }

  // Attribution validation
  if (config.attribution_spec) {
    const clickWindow = config.attribution_spec.click_window;
    const viewWindow = config.attribution_spec.view_window;

    if (!clickWindow) {
      errors.push('Click attribution window is required');
    }

    // Warn about deprecated view attribution windows
    if (viewWindow && DEPRECATED_ATTRIBUTION_WINDOWS.includes(viewWindow as AttributionWindow)) {
      errors.push(`Warning: ${viewWindow} attribution is being deprecated by Meta in 2026. Use click attribution only.`);
    }
  } else {
    errors.push('Attribution specification is required');
  }

  // Targeting validation
  if (!config.targeting) {
    errors.push('Targeting configuration is required');
  } else {
    errors.push(...validateTargeting(config.targeting, campaignConfig));
  }

  // Placements validation
  if (!config.placements) {
    errors.push('Placements configuration is required');
  } else {
    errors.push(...validatePlacements(config.placements));
  }

  // Pixel validation for conversion objectives
  const conversionObjectives: CampaignObjective[] = ['OUTCOME_SALES', 'OUTCOME_LEADS'];
  if (campaignConfig.objective && conversionObjectives.includes(campaignConfig.objective)) {
    if (!config.pixel_config?.pixel_id) {
      errors.push(`Pixel ID is required for ${campaignConfig.objective} objective`);
    }

    if (config.optimization_goal === 'OFFSITE_CONVERSIONS' && !config.promoted_object?.custom_event_type) {
      errors.push('Custom event type is required for offsite conversions');
    }
  }

  return errors;
}

/**
 * Validate Targeting Configuration
 */
function validateTargeting(targeting: any, campaignConfig: Partial<CampaignConfig>): string[] {
  const errors: string[] = [];

  // Age range validation
  if (targeting.age_min === undefined || targeting.age_max === undefined) {
    errors.push('Age range (age_min and age_max) is required');
  } else {
    if (targeting.age_min < VALID_AGE_RANGE.min || targeting.age_min > VALID_AGE_RANGE.max) {
      errors.push(`age_min must be between ${VALID_AGE_RANGE.min} and ${VALID_AGE_RANGE.max}`);
    }

    if (targeting.age_max < VALID_AGE_RANGE.min || targeting.age_max > VALID_AGE_RANGE.max) {
      errors.push(`age_max must be between ${VALID_AGE_RANGE.min} and ${VALID_AGE_RANGE.max}`);
    }

    if (targeting.age_min > targeting.age_max) {
      errors.push('age_min cannot be greater than age_max');
    }
  }

  // Geographic targeting validation
  if (!targeting.geo_locations) {
    errors.push('Geographic targeting (geo_locations) is required');
  } else {
    const geo = targeting.geo_locations;
    const hasLocation = geo.countries?.length > 0 ||
                       geo.regions?.length > 0 ||
                       geo.cities?.length > 0 ||
                       geo.zips?.length > 0;

    if (!hasLocation) {
      errors.push('At least one geographic location (country, region, city, or ZIP) is required');
    }

    // Validate country codes
    if (geo.countries) {
      for (const country of geo.countries) {
        if (country.length !== 2) {
          errors.push(`Invalid country code: ${country}. Must be 2-letter ISO code (e.g., US, CA, GB)`);
        }
      }
    }

    // Validate city radius
    if (geo.cities) {
      for (const city of geo.cities) {
        if (city.radius && (city.radius < 1 || city.radius > 50)) {
          errors.push(`City radius must be between 1 and 50 miles`);
        }
      }
    }
  }

  // Special ad category restrictions
  const hasSpecialCategory = campaignConfig.special_ad_categories?.some(cat => cat !== 'NONE');
  if (hasSpecialCategory) {
    // Employment, Housing, Credit ads have restricted targeting
    if (targeting.age_min < 18 || targeting.age_max > 65) {
      errors.push('Special ad categories require age range between 18 and 65');
    }

    if (targeting.genders && targeting.genders.length === 1) {
      errors.push('Gender targeting not allowed for special ad categories');
    }

    if (targeting.detailed_targeting || targeting.flexible_spec) {
      errors.push('Detailed targeting (interests, behaviors) not allowed for special ad categories');
    }
  }

  // Validate Advantage+ Audience vs traditional targeting
  if (targeting.advantage_audience?.enabled) {
    if (targeting.flexible_spec || targeting.custom_audiences || targeting.lookalike_audiences) {
      errors.push('Cannot use traditional detailed targeting with Advantage+ Audience enabled');
    }

    // Advantage+ audience can have optional age, gender, location constraints
    // These are validated above
  } else {
    // If not using Advantage+ Audience, validate traditional targeting
    // (interests, behaviors, custom audiences, etc.)
    // This is optional, so no errors needed
  }

  // Validate device platforms
  if (targeting.publisher_platforms) {
    const validPlatforms = ['facebook', 'instagram', 'messenger', 'audience_network'];
    for (const platform of targeting.publisher_platforms) {
      if (!validPlatforms.includes(platform)) {
        errors.push(`Invalid publisher platform: ${platform}`);
      }
    }
  }

  return errors;
}

/**
 * Validate Placements Configuration
 */
function validatePlacements(placements: any): string[] {
  const errors: string[] = [];

  // If Advantage+ Placements is enabled, manual placements should not be set
  if (placements.advantage_placements?.enabled) {
    if (placements.facebook_positions || placements.instagram_positions ||
        placements.messenger_positions || placements.audience_network_positions) {
      errors.push('Cannot specify manual placements when Advantage+ Placements is enabled');
    }
    // Advantage+ is recommended - no errors
    return errors;
  }

  // Manual placements validation
  if (!placements.publisher_platforms || placements.publisher_platforms.length === 0) {
    errors.push('At least one publisher platform is required when not using Advantage+ Placements');
  }

  // Validate that specified platforms have corresponding positions
  if (placements.publisher_platforms) {
    if (placements.publisher_platforms.includes('facebook') && !placements.facebook_positions?.length) {
      errors.push('facebook_positions required when facebook is selected as publisher platform');
    }

    if (placements.publisher_platforms.includes('instagram') && !placements.instagram_positions?.length) {
      errors.push('instagram_positions required when instagram is selected as publisher platform');
    }

    if (placements.publisher_platforms.includes('messenger') && !placements.messenger_positions?.length) {
      errors.push('messenger_positions required when messenger is selected as publisher platform');
    }

    if (placements.publisher_platforms.includes('audience_network') && !placements.audience_network_positions?.length) {
      errors.push('audience_network_positions required when audience_network is selected as publisher platform');
    }
  }

  return errors;
}

/**
 * Validate Ad Configuration
 */
export function validateAdConfig(config: Partial<AdConfig>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Ad name is required');
  }

  if (!config.creative) {
    errors.push('Creative configuration is required');
  } else {
    const creative = config.creative;

    // Creative content validation
    if (!creative.title && !creative.body) {
      errors.push('At least one of title or body is required for creative');
    }

    if (creative.title && creative.title.length > 255) {
      errors.push('Creative title must be 255 characters or less');
    }

    if (creative.body && creative.body.length > 5000) {
      errors.push('Creative body must be 5000 characters or less');
    }

    // Media validation
    const hasImage = creative.image_hash || creative.image_url;
    const hasVideo = creative.video_id;
    const hasAssetFeed = creative.asset_feed_spec;

    if (!hasImage && !hasVideo && !hasAssetFeed) {
      errors.push('Creative must have at least one media type (image, video, or asset feed)');
    }

    // Call to action validation
    if (creative.call_to_action) {
      if (!creative.call_to_action.type) {
        errors.push('Call to action type is required');
      }

      if (creative.call_to_action.value?.link && !isValidUrl(creative.call_to_action.value.link)) {
        errors.push('Call to action link must be a valid URL');
      }
    }

    // Link URL validation
    if (creative.link_url && !isValidUrl(creative.link_url)) {
      errors.push('Creative link URL must be a valid URL');
    }

    // Advantage+ Creative validation
    if (creative.advantage_creative?.dynamic_creative?.enabled) {
      if (!creative.asset_feed_spec) {
        errors.push('Asset feed spec is required when dynamic creative is enabled');
      }

      // Dynamic creative requires multiple assets
      if (creative.asset_feed_spec) {
        const spec = creative.asset_feed_spec;
        const hasMultipleAssets =
          (spec.images && spec.images.length > 1) ||
          (spec.videos && spec.videos.length > 1) ||
          (spec.bodies && spec.bodies.length > 1) ||
          (spec.titles && spec.titles.length > 1);

        if (!hasMultipleAssets) {
          errors.push('Dynamic creative requires multiple assets (images, videos, bodies, or titles)');
        }
      }
    }
  }

  return errors;
}

/**
 * Validate Complete Campaign Template
 */
export function validateCampaignTemplate(
  campaignConfig: Partial<CampaignConfig>,
  adSetConfig: Partial<AdSetConfig>,
  adConfig: Partial<AdConfig>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate each level
  errors.push(...validateCampaignConfig(campaignConfig));
  errors.push(...validateAdSetConfig(adSetConfig, campaignConfig));
  errors.push(...validateAdConfig(adConfig));

  // Cross-level validation
  // Ensure optimization goal is compatible with objective
  if (campaignConfig.objective && adSetConfig.optimization_goal) {
    errors.push(...validateObjectiveGoalCompatibility(
      campaignConfig.objective,
      adSetConfig.optimization_goal
    ));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate objective and optimization goal compatibility
 */
function validateObjectiveGoalCompatibility(
  objective: CampaignObjective,
  goal: OptimizationGoal
): string[] {
  const errors: string[] = [];

  const compatibilityMatrix: Record<CampaignObjective, OptimizationGoal[]> = {
    OUTCOME_AWARENESS: ['REACH', 'IMPRESSIONS', 'AD_RECALL_LIFT'],
    OUTCOME_ENGAGEMENT: ['POST_ENGAGEMENT', 'PAGE_LIKES', 'EVENT_RESPONSES', 'ENGAGED_USERS'],
    OUTCOME_LEADS: ['LEAD_GENERATION', 'QUALITY_LEAD', 'CONVERSATIONS', 'OFFSITE_CONVERSIONS'],
    OUTCOME_SALES: ['OFFSITE_CONVERSIONS', 'VALUE', 'LINK_CLICKS', 'LANDING_PAGE_VIEWS'],
    OUTCOME_TRAFFIC: ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'IMPRESSIONS'],
    OUTCOME_APP_PROMOTION: ['APP_INSTALLS', 'LINK_CLICKS', 'OFFSITE_CONVERSIONS'],
  };

  const allowedGoals = compatibilityMatrix[objective];
  if (allowedGoals && !allowedGoals.includes(goal)) {
    errors.push(
      `Optimization goal ${goal} is not compatible with objective ${objective}. ` +
      `Allowed goals: ${allowedGoals.join(', ')}`
    );
  }

  return errors;
}

/**
 * Helper: Validate URL
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get validation warnings (non-blocking recommendations)
 */
export function getValidationWarnings(
  campaignConfig: Partial<CampaignConfig>,
  adSetConfig: Partial<AdSetConfig>
): string[] {
  const warnings: string[] = [];

  // Recommend Advantage+ features for 2025
  if (!adSetConfig.targeting?.advantage_audience?.enabled) {
    warnings.push('Recommendation: Consider using Advantage+ Audience for better AI-powered targeting');
  }

  if (!adSetConfig.placements?.advantage_placements?.enabled) {
    warnings.push('Recommendation: Consider using Advantage+ Placements for automatic placement optimization');
  }

  if (campaignConfig.bid_strategy !== 'LOWEST_COST_WITHOUT_CAP') {
    warnings.push('Recommendation: LOWEST_COST_WITHOUT_CAP is the recommended bid strategy for most campaigns');
  }

  // Warn about deprecated attribution windows
  if (adSetConfig.attribution_spec?.view_window) {
    warnings.push('Warning: View-through attribution windows are being deprecated by Meta in 2026');
  }

  // Budget recommendations
  if (campaignConfig.daily_budget && campaignConfig.daily_budget < 1000) {
    warnings.push('Recommendation: Daily budget below $10 may limit campaign performance');
  }

  return warnings;
}
