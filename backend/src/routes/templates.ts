import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import templateController from '../controllers/templateController';
import { templateValidators } from '../utils/validators';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Validation middleware
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(JSON.stringify(errors.array()), 400);
  }
  next();
};

/**
 * @route   GET /api/templates
 * @desc    List all templates for user
 * @access  Private
 */
router.get(
  '/',
  authenticateJWT,
  (req, res, next) => templateController.listTemplates(req, res).catch(next)
);

/**
 * @route   GET /api/templates/:id
 * @desc    Get template by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateJWT,
  (req, res, next) => templateController.getTemplate(req, res).catch(next)
);

/**
 * @route   POST /api/templates
 * @desc    Create new template
 * @access  Private
 */
router.post(
  '/',
  authenticateJWT,
  templateValidators.create,
  validate,
  (req, res, next) => templateController.createTemplate(req, res).catch(next)
);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update template
 * @access  Private
 */
router.put(
  '/:id',
  authenticateJWT,
  templateValidators.update,
  validate,
  (req, res, next) => templateController.updateTemplate(req, res).catch(next)
);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete template
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateJWT,
  (req, res, next) => templateController.deleteTemplate(req, res).catch(next)
);

/**
 * @route   POST /api/templates/:id/set-default
 * @desc    Set template as default
 * @access  Private
 */
router.post(
  '/:id/set-default',
  authenticateJWT,
  (req, res, next) => templateController.setDefaultTemplate(req, res).catch(next)
);

export default router;
