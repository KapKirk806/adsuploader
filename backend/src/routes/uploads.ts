import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import uploadController from '../controllers/uploadController';

const router = express.Router();

/**
 * @route   POST /api/uploads/files
 * @desc    Upload files for bulk ad creation
 * @access  Private
 */
router.post(
  '/files',
  authenticateJWT,
  uploadMultiple,
  (req, res, next) => uploadController.uploadFiles(req, res).catch(next)
);

/**
 * @route   GET /api/uploads/:jobId/files
 * @desc    Get uploaded files for a job
 * @access  Private
 */
router.get(
  '/:jobId/files',
  authenticateJWT,
  (req, res, next) => uploadController.getJobFiles(req, res).catch(next)
);

/**
 * @route   POST /api/uploads/:jobId/publish
 * @desc    Publish job to Meta Ads
 * @access  Private
 */
router.post(
  '/:jobId/publish',
  authenticateJWT,
  (req, res, next) => uploadController.publishJob(req, res).catch(next)
);

export default router;
