import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import adAccountController from '../controllers/adAccountController';

const router = express.Router();

/**
 * @route   GET /api/ad-accounts
 * @desc    List user's ad accounts
 * @access  Private
 */
router.get(
  '/',
  authenticateJWT,
  (req, res, next) => adAccountController.listAccounts(req, res).catch(next)
);

/**
 * @route   POST /api/ad-accounts/sync
 * @desc    Fetch ad accounts from Meta
 * @access  Private
 */
router.post(
  '/sync',
  authenticateJWT,
  (req, res, next) => adAccountController.fetchFromMeta(req, res).catch(next)
);

/**
 * @route   GET /api/ad-accounts/:id
 * @desc    Get ad account by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateJWT,
  (req, res, next) => adAccountController.getAccount(req, res).catch(next)
);

/**
 * @route   DELETE /api/ad-accounts/:id
 * @desc    Delete ad account
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateJWT,
  (req, res, next) => adAccountController.deleteAccount(req, res).catch(next)
);

export default router;
