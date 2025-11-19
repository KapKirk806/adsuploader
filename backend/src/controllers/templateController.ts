import { Response } from 'express';
import { AuthRequest } from '../types';
import { TemplateModel } from '../models/Template';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import {
  validateCampaignTemplate,
  getValidationWarnings,
  ValidationError,
} from '../utils/metaAdsValidation';
import { CampaignConfig, AdSetConfig, AdConfig } from '../types/metaAds';
import {
  MetaAdsTemplateMonitor,
  MetaAdsPerformanceMonitor,
} from '../utils/metaAdsMonitoring';

export class TemplateController {
  /**
   * List all templates for user
   */
  async listTemplates(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const templates = await TemplateModel.findByUserId(req.user.id);

      res.json({
        templates: templates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          objective: t.objective,
          is_default: t.is_default,
          created_at: t.created_at,
        })),
      });
    } catch (error) {
      logger.error('List templates error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to list templates', 500);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const template = await TemplateModel.findById(parseInt(id));

      if (!template) {
        throw new AppError('Template not found', 404);
      }

      if (template.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      res.json({ template });
    } catch (error) {
      logger.error('Get template error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get template', 500);
    }
  }

  /**
   * Create new template
   */
  async createTemplate(req: AuthRequest, res: Response) {
    const validationStartTime = Date.now();

    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { name, description, objective, campaign_config, adset_config, ad_config, is_default } = req.body;

      // Validate Meta Ads configuration
      const validation = validateCampaignTemplate(
        campaign_config as CampaignConfig,
        adset_config as AdSetConfig,
        ad_config as AdConfig
      );

      // Track validation performance
      const validationDuration = Date.now() - validationStartTime;
      MetaAdsPerformanceMonitor.trackValidation(req.user.id, validationDuration, !validation.valid);

      if (!validation.valid) {
        // Log validation errors with monitoring
        MetaAdsTemplateMonitor.logValidationError(
          req.user.id,
          'create',
          validation.errors,
          { campaign_config, adset_config, ad_config }
        );
        throw new AppError(`Validation failed: ${validation.errors.join('; ')}`, 400);
      }

      // Get validation warnings (non-blocking recommendations)
      const warnings = getValidationWarnings(campaign_config, adset_config);

      const template = await TemplateModel.create({
        user_id: req.user.id,
        name,
        description,
        objective,
        campaign_config,
        adset_config,
        ad_config,
        is_default,
      });

      // Log template creation with comprehensive monitoring
      MetaAdsTemplateMonitor.logTemplateCreation(
        req.user.id,
        template.id!,
        campaign_config as CampaignConfig,
        adset_config as AdSetConfig,
        ad_config as AdConfig
      );

      // Log warnings if any
      if (warnings.length > 0) {
        MetaAdsTemplateMonitor.logValidationWarnings(req.user.id, template.id, warnings);
      }

      res.status(201).json({
        message: 'Template created successfully',
        template,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error) {
      logger.error('Create template error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create template', 500);
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req: AuthRequest, res: Response) {
    const validationStartTime = Date.now();

    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const template = await TemplateModel.findById(parseInt(id));

      if (!template) {
        throw new AppError('Template not found', 404);
      }

      if (template.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      const { campaign_config, adset_config, ad_config } = req.body;

      // Validate if configuration fields are being updated
      if (campaign_config || adset_config || ad_config) {
        const updatedCampaignConfig = campaign_config || template.campaign_config;
        const updatedAdSetConfig = adset_config || template.adset_config;
        const updatedAdConfig = ad_config || template.ad_config;

        const validation = validateCampaignTemplate(
          updatedCampaignConfig as CampaignConfig,
          updatedAdSetConfig as AdSetConfig,
          updatedAdConfig as AdConfig
        );

        // Track validation performance
        const validationDuration = Date.now() - validationStartTime;
        MetaAdsPerformanceMonitor.trackValidation(req.user.id, validationDuration, !validation.valid);

        if (!validation.valid) {
          // Log validation errors with monitoring
          MetaAdsTemplateMonitor.logValidationError(
            req.user.id,
            'update',
            validation.errors,
            { campaign_config: updatedCampaignConfig, adset_config: updatedAdSetConfig, ad_config: updatedAdConfig }
          );
          throw new AppError(`Validation failed: ${validation.errors.join('; ')}`, 400);
        }

        // Get validation warnings
        const warnings = getValidationWarnings(updatedCampaignConfig, updatedAdSetConfig);
        if (warnings.length > 0) {
          MetaAdsTemplateMonitor.logValidationWarnings(req.user.id, parseInt(id), warnings);
        }
      }

      const updated = await TemplateModel.update(parseInt(id), req.body);

      // Log template update with change tracking
      MetaAdsTemplateMonitor.logTemplateUpdate(
        req.user.id,
        parseInt(id),
        Object.keys(req.body),
        {
          campaign_config: template.campaign_config,
          adset_config: template.adset_config,
          ad_config: template.ad_config,
        },
        {
          campaign_config: updated?.campaign_config,
          adset_config: updated?.adset_config,
          ad_config: updated?.ad_config,
        }
      );

      res.json({
        message: 'Template updated successfully',
        template: updated,
      });
    } catch (error) {
      logger.error('Update template error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update template', 500);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const template = await TemplateModel.findById(parseInt(id));

      if (!template) {
        throw new AppError('Template not found', 404);
      }

      if (template.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      await TemplateModel.delete(parseInt(id));

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      logger.error('Delete template error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete template', 500);
    }
  }

  /**
   * Set template as default
   */
  async setDefaultTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const template = await TemplateModel.findById(parseInt(id));

      if (!template) {
        throw new AppError('Template not found', 404);
      }

      if (template.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      await TemplateModel.setAsDefault(parseInt(id), req.user.id);

      res.json({ message: 'Template set as default' });
    } catch (error) {
      logger.error('Set default template error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to set default template', 500);
    }
  }
}

export default new TemplateController();
