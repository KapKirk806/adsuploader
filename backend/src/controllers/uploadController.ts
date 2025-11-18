import { Response } from 'express';
import { AuthRequest } from '../types';
import { JobModel } from '../models/Job';
import { CreativeModel } from '../models/Creative';
import { addUploadJob } from '../services/jobQueue';
import { getImageMetadata, getVideoMetadata } from '../utils/fileProcessor';
import { extractVariationInfo } from '../utils/variationDetector';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import path from 'path';

export class UploadController {
  /**
   * Upload files
   */
  async uploadFiles(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const files = req.files as Express.Multer.File[];
      const { ad_account_id, template_id } = req.body;

      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      if (!ad_account_id) {
        throw new AppError('Ad account ID required', 400);
      }

      // Create upload job
      const job = await JobModel.create({
        user_id: req.user.id,
        ad_account_id: parseInt(ad_account_id),
        template_id: template_id ? parseInt(template_id) : undefined,
        total_ads: files.length,
      });

      // Process each file and create creative records
      const creativePromises = files.map(async (file) => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const metadata = fileType === 'image'
          ? await getImageMetadata(file.path)
          : await getVideoMetadata(file.path);

        // Extract variation info
        const variationInfo = extractVariationInfo(file.originalname);

        // Create creative record
        return CreativeModel.create({
          upload_job_id: job.id,
          user_id: req.user!.id,
          file_name: file.filename,
          original_file_name: file.originalname,
          file_type: fileType,
          file_size: file.size,
          file_url: `/uploads/${file.filename}`,
          width: metadata.width,
          height: metadata.height,
          aspect_ratio: metadata.aspectRatio,
          duration: metadata.duration,
          variation_group: variationInfo?.group,
          variation_number: variationInfo?.number,
        });
      });

      const creatives = await Promise.all(creativePromises);

      logger.info(`Created job ${job.id} with ${creatives.length} creatives`);

      res.status(201).json({
        message: 'Files uploaded successfully',
        job: {
          id: job.id,
          status: job.status,
          total_ads: job.total_ads,
          created_at: job.created_at,
        },
        creatives: creatives.map((c) => ({
          id: c.id,
          filename: c.original_file_name,
          type: c.file_type,
          aspect_ratio: c.aspect_ratio,
          variation_group: c.variation_group,
        })),
      });
    } catch (error) {
      logger.error('Upload error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upload files', 500);
    }
  }

  /**
   * Get uploaded files for a job
   */
  async getJobFiles(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { jobId } = req.params;
      const job = await JobModel.findById(parseInt(jobId));

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      if (job.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      const creatives = await CreativeModel.findByJobId(job.id);

      res.json({
        job: {
          id: job.id,
          status: job.status,
          total_ads: job.total_ads,
          completed_ads: job.completed_ads,
          failed_ads: job.failed_ads,
          progress_percentage: job.progress_percentage,
        },
        creatives: creatives.map((c) => ({
          id: c.id,
          filename: c.original_file_name,
          type: c.file_type,
          aspect_ratio: c.aspect_ratio,
          variation_group: c.variation_group,
          variation_number: c.variation_number,
          status: c.status,
          thumbnail_url: c.thumbnail_url,
          facebook_ad_id: c.facebook_ad_id,
        })),
      });
    } catch (error) {
      logger.error('Get job files error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get job files', 500);
    }
  }

  /**
   * Publish job to Meta
   */
  async publishJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { jobId } = req.params;
      const job = await JobModel.findById(parseInt(jobId));

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      if (job.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      if (job.status !== 'pending') {
        throw new AppError('Job already processed', 400);
      }

      // Get all creatives for this job
      const creatives = await CreativeModel.findByJobId(job.id);

      if (creatives.length === 0) {
        throw new AppError('No creatives found for job', 400);
      }

      // Add job to queue
      await addUploadJob({
        jobId: job.id,
        userId: job.user_id,
        adAccountId: job.ad_account_id,
        templateId: job.template_id || undefined,
        creativeIds: creatives.map((c) => c.id),
      });

      res.json({
        message: 'Job queued for publishing',
        job: {
          id: job.id,
          status: 'processing',
          total_ads: job.total_ads,
        },
      });
    } catch (error) {
      logger.error('Publish job error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to publish job', 500);
    }
  }
}

export default new UploadController();
