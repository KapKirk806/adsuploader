import express from 'express';
import { authenticateJWT, optionalAuth } from '../middleware/auth';
import googleDriveController from '../controllers/googleDriveController';

const router = express.Router();

/**
 * @route   GET /api/google-drive/connect
 * @desc    Get Google Drive OAuth URL
 * @access  Private
 */
router.get(
  '/connect',
  authenticateJWT,
  (req, res, next) => googleDriveController.connect(req, res).catch(next)
);

/**
 * @route   GET /api/google-drive/callback
 * @desc    Handle OAuth callback
 * @access  Public
 */
router.get(
  '/callback',
  (req, res, next) => googleDriveController.callback(req, res).catch(next)
);

/**
 * @route   GET /api/google-drive/files
 * @desc    List files from Google Drive
 * @access  Private
 */
router.get(
  '/files',
  authenticateJWT,
  (req, res, next) => googleDriveController.listFiles(req, res).catch(next)
);

/**
 * @route   POST /api/google-drive/import
 * @desc    Import files from Google Drive
 * @access  Private
 */
router.post(
  '/import',
  authenticateJWT,
  (req, res, next) => googleDriveController.importFiles(req, res).catch(next)
);

/**
 * @route   GET /api/google-drive/status
 * @desc    Check Google Drive connection status
 * @access  Private
 */
router.get(
  '/status',
  authenticateJWT,
  (req, res, next) => googleDriveController.checkConnection(req, res).catch(next)
);

export default router;
