import { Response } from 'express';
import { AuthRequest } from '../types';
import { JobModel } from '../models/Job';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class JobController {
  /**
   * List all jobs for user
   */
  async listJobs(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const jobs = await JobModel.findByUserId(req.user.id, page, limit, status);

      res.json({
        jobs: jobs.map((j) => ({
          id: j.id,
          status: j.status,
          total_ads: j.total_ads,
          completed_ads: j.completed_ads,
          failed_ads: j.failed_ads,
          progress_percentage: j.progress_percentage,
          campaign_id: j.campaign_id,
          created_at: j.created_at,
          completed_at: j.completed_at,
        })),
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      logger.error('List jobs error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to list jobs', 500);
    }
  }

  /**
   * Get job by ID
   */
  async getJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const job = await JobModel.findById(parseInt(id));

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      if (job.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      res.json({ job });
    } catch (error) {
      logger.error('Get job error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get job', 500);
    }
  }

  /**
   * Get job progress
   */
  async getJobProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const job = await JobModel.findById(parseInt(id));

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      if (job.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      res.json({
        id: job.id,
        status: job.status,
        progress_percentage: job.progress_percentage,
        total_ads: job.total_ads,
        completed_ads: job.completed_ads,
        failed_ads: job.failed_ads,
        error_log: job.error_log,
      });
    } catch (error) {
      logger.error('Get job progress error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get job progress', 500);
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const job = await JobModel.findById(parseInt(id));

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      if (job.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      if (job.status === 'completed' || job.status === 'failed') {
        throw new AppError('Cannot cancel completed or failed job', 400);
      }

      await JobModel.updateStatus(parseInt(id), 'cancelled');

      res.json({ message: 'Job cancelled successfully' });
    } catch (error) {
      logger.error('Cancel job error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to cancel job', 500);
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const stats = await JobModel.getStats(req.user.id);

      res.json({ stats });
    } catch (error) {
      logger.error('Get job stats error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get job statistics', 500);
    }
  }
}

export default new JobController();
