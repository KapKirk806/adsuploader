import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import authController from '../controllers/authController';
import { authValidators } from '../utils/validators';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';

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
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  authValidators.register,
  validate,
  (req, res, next) => authController.register(req, res).catch(next)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  authValidators.login,
  validate,
  (req, res, next) => authController.login(req, res).catch(next)
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  authenticateJWT,
  (req, res, next) => authController.getCurrentUser(req, res).catch(next)
);

/**
 * @route   GET /api/auth/facebook
 * @desc    Initiate Facebook OAuth
 * @access  Public
 */
router.get(
  '/facebook',
  (req, res, next) => authController.facebookAuth(req, res).catch(next)
);

/**
 * @route   GET /api/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
router.get(
  '/facebook/callback',
  (req, res, next) => authController.facebookCallback(req, res).catch(next)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticateJWT,
  (req, res, next) => authController.logout(req, res).catch(next)
);

export default router;
