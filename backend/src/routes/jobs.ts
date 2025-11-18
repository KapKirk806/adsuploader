import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import jobController from '../controllers/jobController';

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    List all jobs for user
 * @access  Private
 */
router.get(
  '/',
  authenticateJWT,
  (req, res, next) => jobController.listJobs(req, res).catch(next)
);

/**
 * @route   GET /api/jobs/stats
 * @desc    Get job statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticateJWT,
  (req, res, next) => jobController.getJobStats(req, res).catch(next)
);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateJWT,
  (req, res, next) => jobController.getJob(req, res).catch(next)
);

/**
 * @route   GET /api/jobs/:id/progress
 * @desc    Get job progress
 * @access  Private
 */
router.get(
  '/:id/progress',
  authenticateJWT,
  (req, res, next) => jobController.getJobProgress(req, res).catch(next)
);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Cancel job
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateJWT,
  (req, res, next) => jobController.cancelJob(req, res).catch(next)
);

export default router;
