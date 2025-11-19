/**
 * Meta Ads Monitoring and Debugging
 * Comprehensive monitoring for Meta Ads template operations, feature usage, and API interactions
 */

import logger from '../config/logger';
import { MetricsCollector } from './monitoring';
import {
  CampaignConfig,
  AdSetConfig,
  AdConfig,
  CampaignObjective,
  BidStrategy,
  AttributionWindow,
} from '../types/metaAds';

/**
 * Monitor Template Operations
 */
export class MetaAdsTemplateMonitor {
  /**
   * Log template creation with detailed configuration analysis
   */
  static logTemplateCreation(
    userId: number,
    templateId: number,
    campaignConfig: CampaignConfig,
    adsetConfig: AdSetConfig,
    adConfig: AdConfig
  ) {
    const features = this.analyzeFeatureUsage(campaignConfig, adsetConfig, adConfig);

    logger.info('Meta Ads template created', {
      user_id: userId,
      template_id: templateId,
      objective: campaignConfig.objective,
      bid_strategy: campaignConfig.bid_strategy,
      features_used: features,
      advantage_features: {
        campaign_budget_optimization: campaignConfig.campaign_budget_optimization?.enabled || false,
        advantage_audience: adsetConfig.targeting?.advantage_audience?.enabled || false,
        advantage_placements: adsetConfig.placements?.advantage_placements?.enabled || false,
        advantage_creative: !!adConfig.creative?.advantage_creative,
      },
      budget_type: campaignConfig.daily_budget ? 'daily' : 'lifetime',
      budget_amount: campaignConfig.daily_budget || campaignConfig.lifetime_budget,
      attribution_window: adsetConfig.attribution_spec?.click_window,
      has_pixel: !!adsetConfig.pixel_config?.pixel_id,
      targeting_type: adsetConfig.targeting?.advantage_audience?.enabled ? 'advantage+' : 'manual',
    });

    // Track metrics
    MetricsCollector.recordMetric('template_creation', 1);
    MetricsCollector.recordMetric(`template_objective_${campaignConfig.objective}`, 1);
    MetricsCollector.recordMetric(`template_bid_strategy_${campaignConfig.bid_strategy}`, 1);

    // Track Advantage+ feature adoption
    if (adsetConfig.targeting?.advantage_audience?.enabled) {
      MetricsCollector.recordMetric('advantage_audience_usage', 1);
    }
    if (adsetConfig.placements?.advantage_placements?.enabled) {
      MetricsCollector.recordMetric('advantage_placements_usage', 1);
    }
    if (adConfig.creative?.advantage_creative) {
      MetricsCollector.recordMetric('advantage_creative_usage', 1);
    }
  }

  /**
   * Log template update with change tracking
   */
  static logTemplateUpdate(
    userId: number,
    templateId: number,
    updatedFields: string[],
    oldConfig: any,
    newConfig: any
  ) {
    logger.info('Meta Ads template updated', {
      user_id: userId,
      template_id: templateId,
      updated_fields: updatedFields,
      changes: this.detectConfigChanges(oldConfig, newConfig),
    });

    MetricsCollector.recordMetric('template_update', 1);
  }

  /**
   * Log validation errors with detailed context
   */
  static logValidationError(
    userId: number,
    operation: 'create' | 'update',
    errors: string[],
    config: any
  ) {
    logger.error('Meta Ads template validation failed', {
      user_id: userId,
      operation,
      error_count: errors.length,
      errors: errors,
      config_snapshot: {
        objective: config.campaign_config?.objective,
        bid_strategy: config.campaign_config?.bid_strategy,
        optimization_goal: config.adset_config?.optimization_goal,
        has_pixel: !!config.adset_config?.pixel_config?.pixel_id,
      },
    });

    // Track validation failures by type
    errors.forEach((error) => {
      const errorType = this.categorizeError(error);
      MetricsCollector.recordMetric(`validation_error_${errorType}`, 1);
    });

    MetricsCollector.recordMetric('template_validation_failure', 1);
  }

  /**
   * Log validation warnings (non-blocking)
   */
  static logValidationWarnings(
    userId: number,
    templateId: number | undefined,
    warnings: string[]
  ) {
    if (warnings.length === 0) return;

    logger.warn('Meta Ads template validation warnings', {
      user_id: userId,
      template_id: templateId,
      warning_count: warnings.length,
      warnings: warnings,
    });

    // Track warning types
    warnings.forEach((warning) => {
      if (warning.includes('Advantage+')) {
        MetricsCollector.recordMetric('warning_advantage_not_used', 1);
      }
      if (warning.includes('deprecated')) {
        MetricsCollector.recordMetric('warning_deprecated_feature', 1);
      }
      if (warning.includes('budget')) {
        MetricsCollector.recordMetric('warning_low_budget', 1);
      }
    });
  }

  /**
   * Analyze which Meta Ads features are being used
   */
  private static analyzeFeatureUsage(
    campaignConfig: CampaignConfig,
    adsetConfig: AdSetConfig,
    adConfig: AdConfig
  ): string[] {
    const features: string[] = [];

    // Campaign level features
    if (campaignConfig.campaign_budget_optimization?.enabled) {
      features.push('campaign_budget_optimization');
    }
    if (campaignConfig.special_ad_categories?.some(cat => cat !== 'NONE')) {
      features.push('special_ad_categories');
    }

    // Ad Set level features
    if (adsetConfig.pixel_config?.pixel_id) {
      features.push('pixel_tracking');
    }
    if (adsetConfig.pixel_config?.capi_integration?.enabled) {
      features.push('conversions_api');
    }
    if (adsetConfig.targeting?.advantage_audience?.enabled) {
      features.push('advantage_audience');
    }
    if (adsetConfig.targeting?.custom_audiences && adsetConfig.targeting.custom_audiences.length > 0) {
      features.push('custom_audiences');
    }
    if (adsetConfig.targeting?.lookalike_audiences && adsetConfig.targeting.lookalike_audiences.length > 0) {
      features.push('lookalike_audiences');
    }
    if (adsetConfig.placements?.advantage_placements?.enabled) {
      features.push('advantage_placements');
    }
    if (adsetConfig.frequency_cap) {
      features.push('frequency_cap');
    }

    // Creative level features
    if (adConfig.creative?.advantage_creative?.dynamic_creative?.enabled) {
      features.push('dynamic_creative');
    }
    if (adConfig.creative?.advantage_creative?.image_enhancements?.enabled) {
      features.push('image_enhancements');
    }
    if (adConfig.creative?.advantage_creative?.video_enhancements?.enabled) {
      features.push('video_enhancements');
    }
    if (adConfig.creative?.advantage_creative?.text_optimization?.enabled) {
      features.push('text_optimization');
    }
    if (adConfig.creative?.asset_feed_spec) {
      features.push('asset_feed');
    }

    return features;
  }

  /**
   * Detect changes between old and new configurations
   */
  private static detectConfigChanges(oldConfig: any, newConfig: any): string[] {
    const changes: string[] = [];

    // Compare campaign config
    if (oldConfig.campaign_config && newConfig.campaign_config) {
      if (oldConfig.campaign_config.objective !== newConfig.campaign_config.objective) {
        changes.push(`objective: ${oldConfig.campaign_config.objective} → ${newConfig.campaign_config.objective}`);
      }
      if (oldConfig.campaign_config.bid_strategy !== newConfig.campaign_config.bid_strategy) {
        changes.push(`bid_strategy: ${oldConfig.campaign_config.bid_strategy} → ${newConfig.campaign_config.bid_strategy}`);
      }
      if (oldConfig.campaign_config.daily_budget !== newConfig.campaign_config.daily_budget) {
        changes.push(`daily_budget: ${oldConfig.campaign_config.daily_budget} → ${newConfig.campaign_config.daily_budget}`);
      }
    }

    // Compare adset config
    if (oldConfig.adset_config && newConfig.adset_config) {
      if (oldConfig.adset_config.optimization_goal !== newConfig.adset_config.optimization_goal) {
        changes.push(`optimization_goal: ${oldConfig.adset_config.optimization_goal} → ${newConfig.adset_config.optimization_goal}`);
      }

      // Track Advantage+ feature adoption/removal
      const oldAdvAudience = oldConfig.adset_config.targeting?.advantage_audience?.enabled;
      const newAdvAudience = newConfig.adset_config.targeting?.advantage_audience?.enabled;
      if (oldAdvAudience !== newAdvAudience) {
        changes.push(`advantage_audience: ${oldAdvAudience} → ${newAdvAudience}`);
      }

      const oldAdvPlacements = oldConfig.adset_config.placements?.advantage_placements?.enabled;
      const newAdvPlacements = newConfig.adset_config.placements?.advantage_placements?.enabled;
      if (oldAdvPlacements !== newAdvPlacements) {
        changes.push(`advantage_placements: ${oldAdvPlacements} → ${newAdvPlacements}`);
      }
    }

    return changes;
  }

  /**
   * Categorize error for metrics tracking
   */
  private static categorizeError(error: string): string {
    if (error.includes('budget')) return 'budget';
    if (error.includes('targeting')) return 'targeting';
    if (error.includes('pixel')) return 'pixel';
    if (error.includes('attribution')) return 'attribution';
    if (error.includes('placement')) return 'placement';
    if (error.includes('creative')) return 'creative';
    if (error.includes('objective')) return 'objective';
    if (error.includes('bid')) return 'bid';
    return 'other';
  }
}

/**
 * Monitor Meta API Interactions
 */
export class MetaAPIMonitor {
  /**
   * Log Meta API request
   */
  static logAPIRequest(
    endpoint: string,
    method: string,
    params: any,
    userId?: number
  ) {
    logger.debug('Meta API request', {
      endpoint,
      method,
      user_id: userId,
      params_summary: this.summarizeParams(params),
    });

    MetricsCollector.recordMetric('meta_api_request', 1);
    MetricsCollector.recordMetric(`meta_api_${method.toLowerCase()}`, 1);
  }

  /**
   * Log Meta API response
   */
  static logAPIResponse(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: number
  ) {
    const level = statusCode >= 400 ? 'error' : 'info';

    logger[level]('Meta API response', {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      user_id: userId,
    });

    MetricsCollector.recordMetric('meta_api_response', duration);

    if (statusCode >= 400) {
      MetricsCollector.recordMetric('meta_api_error', 1);
      MetricsCollector.recordMetric(`meta_api_error_${statusCode}`, 1);
    } else {
      MetricsCollector.recordMetric('meta_api_success', 1);
    }

    // Alert on slow API calls (>5s)
    if (duration > 5000) {
      logger.warn('Slow Meta API call detected', {
        endpoint,
        method,
        duration_ms: duration,
      });
    }
  }

  /**
   * Log Meta API error with detailed context
   */
  static logAPIError(
    endpoint: string,
    method: string,
    error: any,
    userId?: number
  ) {
    logger.error('Meta API error', {
      endpoint,
      method,
      user_id: userId,
      error_code: error.code,
      error_subcode: error.error_subcode,
      error_message: error.message,
      error_type: error.type,
      fbtrace_id: error.fbtrace_id,
    });

    MetricsCollector.recordMetric('meta_api_error_detailed', 1);

    // Track specific error types
    if (error.code === 190) {
      MetricsCollector.recordMetric('meta_api_error_auth', 1);
    } else if (error.code === 100) {
      MetricsCollector.recordMetric('meta_api_error_invalid_param', 1);
    } else if (error.code === 80001 || error.code === 80002) {
      MetricsCollector.recordMetric('meta_api_error_ads', 1);
    }
  }

  /**
   * Summarize API params for logging (remove sensitive data)
   */
  private static summarizeParams(params: any): any {
    const summary: any = {};

    if (params.campaign_id) summary.campaign_id = params.campaign_id;
    if (params.adset_id) summary.adset_id = params.adset_id;
    if (params.ad_id) summary.ad_id = params.ad_id;
    if (params.objective) summary.objective = params.objective;
    if (params.optimization_goal) summary.optimization_goal = params.optimization_goal;

    // Don't log access tokens, creative hashes, etc.
    return summary;
  }
}

/**
 * Monitor Upload Job Operations with Meta Ads
 */
export class MetaAdsJobMonitor {
  /**
   * Log job creation with template details
   */
  static logJobCreation(
    userId: number,
    jobId: number,
    templateId: number | undefined,
    adAccountId: string,
    totalFiles: number,
    campaignConfig: CampaignConfig
  ) {
    logger.info('Meta Ads upload job created', {
      user_id: userId,
      job_id: jobId,
      template_id: templateId,
      ad_account_id: adAccountId,
      total_files: totalFiles,
      objective: campaignConfig.objective,
      bid_strategy: campaignConfig.bid_strategy,
      budget_type: campaignConfig.daily_budget ? 'daily' : 'lifetime',
      budget_amount: campaignConfig.daily_budget || campaignConfig.lifetime_budget,
    });

    MetricsCollector.recordMetric('meta_ads_job_created', 1);
    MetricsCollector.recordMetric('meta_ads_job_total_files', totalFiles);
  }

  /**
   * Log job completion with results
   */
  static logJobCompletion(
    userId: number,
    jobId: number,
    totalFiles: number,
    successfulFiles: number,
    failedFiles: number,
    duration: number
  ) {
    const successRate = (successfulFiles / totalFiles) * 100;

    logger.info('Meta Ads upload job completed', {
      user_id: userId,
      job_id: jobId,
      total_files: totalFiles,
      successful_files: successfulFiles,
      failed_files: failedFiles,
      success_rate: `${successRate.toFixed(2)}%`,
      duration_ms: duration,
    });

    MetricsCollector.recordMetric('meta_ads_job_completed', 1);
    MetricsCollector.recordMetric('meta_ads_job_duration', duration);
    MetricsCollector.recordMetric('meta_ads_job_success_rate', successRate);

    if (failedFiles > 0) {
      logger.warn('Meta Ads job had failures', {
        job_id: jobId,
        failed_files: failedFiles,
        success_rate: `${successRate.toFixed(2)}%`,
      });
    }
  }

  /**
   * Log individual creative upload
   */
  static logCreativeUpload(
    jobId: number,
    creativeId: number,
    fileName: string,
    fileType: string,
    fileSize: number,
    status: 'success' | 'failed',
    errorMessage?: string
  ) {
    if (status === 'success') {
      logger.debug('Creative uploaded successfully', {
        job_id: jobId,
        creative_id: creativeId,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
      });
      MetricsCollector.recordMetric('creative_upload_success', 1);
    } else {
      logger.error('Creative upload failed', {
        job_id: jobId,
        creative_id: creativeId,
        file_name: fileName,
        error_message: errorMessage,
      });
      MetricsCollector.recordMetric('creative_upload_failed', 1);
    }
  }
}

/**
 * Performance tracking for Meta Ads operations
 */
export class MetaAdsPerformanceMonitor {
  /**
   * Track template validation performance
   */
  static trackValidation(userId: number, duration: number, hasErrors: boolean) {
    logger.debug('Template validation performance', {
      user_id: userId,
      duration_ms: duration,
      has_errors: hasErrors,
    });

    MetricsCollector.recordMetric('template_validation_duration', duration);

    if (duration > 1000) {
      logger.warn('Slow template validation detected', {
        user_id: userId,
        duration_ms: duration,
      });
    }
  }

  /**
   * Track campaign creation performance
   */
  static trackCampaignCreation(campaignId: string, duration: number) {
    logger.info('Campaign creation performance', {
      campaign_id: campaignId,
      duration_ms: duration,
    });

    MetricsCollector.recordMetric('campaign_creation_duration', duration);

    if (duration > 5000) {
      logger.warn('Slow campaign creation detected', {
        campaign_id: campaignId,
        duration_ms: duration,
      });
    }
  }
}
