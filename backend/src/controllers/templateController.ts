import { Response } from 'express';
import { AuthRequest } from '../types';
import { TemplateModel } from '../models/Template';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';

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
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { name, description, objective, campaign_config, adset_config, ad_config, is_default } = req.body;

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

      logger.info(`Template created: ${template.id}`);

      res.status(201).json({
        message: 'Template created successfully',
        template,
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

      const updated = await TemplateModel.update(parseInt(id), req.body);

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
