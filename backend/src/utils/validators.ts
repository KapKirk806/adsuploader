import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for authentication
 */
export const authValidators = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

/**
 * Validation rules for ad accounts
 */
export const adAccountValidators = {
  create: [
    body('facebook_ad_account_id').notEmpty().withMessage('Facebook ad account ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
  ],
  update: [
    param('id').isInt().withMessage('Valid account ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('is_active').optional().isBoolean(),
  ],
};

/**
 * Validation rules for campaign templates
 */
export const templateValidators = {
  create: [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Template name required'),
    body('description').optional().trim(),
    body('objective').notEmpty().withMessage('Campaign objective required'),
    body('campaign_config').isObject().withMessage('Campaign config must be an object'),
    body('adset_config').isObject().withMessage('Ad set config must be an object'),
    body('ad_config').isObject().withMessage('Ad config must be an object'),
  ],
  update: [
    param('id').isInt().withMessage('Valid template ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().trim(),
    body('campaign_config').optional().isObject(),
    body('adset_config').optional().isObject(),
    body('ad_config').optional().isObject(),
  ],
};

/**
 * Validation rules for upload jobs
 */
export const jobValidators = {
  create: [
    body('ad_account_id').isInt().withMessage('Valid ad account ID required'),
    body('template_id').optional().isInt(),
    body('job_type').optional().isIn(['bulk_upload', 'single_upload']),
  ],
  getById: [param('id').isInt().withMessage('Valid job ID required')],
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  ],
};

/**
 * Validation rules for file uploads
 */
export const uploadValidators = {
  metadata: [
    body('files').isArray({ min: 1 }).withMessage('At least one file required'),
    body('files.*.filename').notEmpty().withMessage('Filename required'),
    body('files.*.size').isInt({ min: 1 }).withMessage('File size required'),
    body('files.*.type').isIn(['image', 'video']).withMessage('Invalid file type'),
  ],
};

/**
 * Common parameter validators
 */
export const commonValidators = {
  id: [param('id').isInt().withMessage('Valid ID required')],
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1-100'),
  ],
  search: [
    query('q').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Search query too long'),
  ],
};
