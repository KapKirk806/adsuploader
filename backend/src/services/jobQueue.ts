/**
 * Job Queue Service using BullMQ
 * Handles async processing of ad upload jobs
 */

import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import logger from '../config/logger';
import { JobModel } from '../models/Job';
import { CreativeModel } from '../models/Creative';
import metaApi from './metaApi';
import { TemplateModel } from '../models/Template';
import { UserModel } from '../models/User';

export interface UploadJobData {
  jobId: number;
  userId: number;
  adAccountId: number;
  templateId?: number;
  creativeIds: number[];
}

// Create queue
export const uploadQueue = new Queue<UploadJobData>('upload-jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 172800, // Keep failed jobs for 48 hours
    },
  },
});

// Create worker
const worker = new Worker<UploadJobData>(
  'upload-jobs',
  async (job: Job<UploadJobData>) => {
    const { jobId, userId, adAccountId, templateId, creativeIds } = job.data;

    logger.info(`Processing upload job ${jobId} with ${creativeIds.length} creatives`);

    try {
      // Update job status
      await JobModel.updateStatus(jobId, 'processing');

      // Get template
      const template = templateId
        ? await TemplateModel.findById(templateId)
        : await TemplateModel.findDefaultByUserId(userId);

      if (!template) {
        throw new Error('No template found for job');
      }

      // Get user for access token
      const user = await UserModel.findById(userId);
      if (!user || !user.access_token) {
        throw new Error('User access token not found');
      }

      // Create campaign
      const campaign = await metaApi.createCampaign(
        `act_${adAccountId}`,
        template.campaign_config,
        user.access_token
      );

      logger.info(`Created campaign: ${campaign.id}`);

      // Create ad set
      const adSet = await metaApi.createAdSet(
        `act_${adAccountId}`,
        template.adset_config,
        user.access_token
      );

      logger.info(`Created ad set: ${adSet.id}`);

      // Save campaign and adset IDs to job
      await JobModel.setCampaignInfo(jobId, campaign.id, adSet.id);

      // Process each creative
      let completedCount = 0;
      let failedCount = 0;

      for (const creativeId of creativeIds) {
        try {
          const creative = await CreativeModel.findById(creativeId);
          if (!creative) {
            failedCount++;
            continue;
          }

          // Update progress
          await job.updateProgress((completedCount / creativeIds.length) * 100);

          // Upload media to Meta
          let mediaHash: string;
          let mediaId: string;

          if (creative.file_type === 'image') {
            const uploadResult = await metaApi.uploadImage(
              `act_${adAccountId}`,
              creative.file_url,
              creative.file_name,
              user.access_token
            );
            mediaHash = uploadResult.images[creative.file_name].hash;
          } else {
            const uploadResult = await metaApi.uploadVideo(
              `act_${adAccountId}`,
              creative.file_url,
              creative.original_file_name,
              user.access_token
            );
            mediaId = uploadResult.id;
          }

          // Create ad creative
          const adCreativeData = {
            name: `${template.name} - ${creative.original_file_name}`,
            object_story_spec: creative.file_type === 'image'
              ? {
                  ...template.ad_config.creative.object_story_spec,
                  link_data: {
                    ...template.ad_config.creative.object_story_spec.link_data,
                    image_hash: mediaHash,
                  },
                }
              : {
                  ...template.ad_config.creative.object_story_spec,
                  video_data: {
                    ...template.ad_config.creative.object_story_spec.video_data,
                    video_id: mediaId!,
                  },
                },
          };

          const adCreative = await metaApi.createAdCreative(
            `act_${adAccountId}`,
            adCreativeData,
            user.access_token
          );

          // Create ad
          const adData = {
            name: `${template.name} - ${creative.original_file_name}`,
            adset_id: adSet.id,
            creative: {
              creative_id: adCreative.id,
            },
            status: template.ad_config.status,
          };

          const ad = await metaApi.createAd(
            `act_${adAccountId}`,
            adData,
            user.access_token
          );

          // Update creative with Facebook IDs
          await CreativeModel.updateFacebookIds(creativeId, adCreative.id, ad.id);
          await CreativeModel.updateStatus(creativeId, 'completed');

          completedCount++;
          logger.info(`Processed creative ${creativeId}: Ad ${ad.id} created`);
        } catch (error: any) {
          logger.error(`Error processing creative ${creativeId}:`, error);
          await CreativeModel.updateStatus(
            creativeId,
            'failed',
            error.message
          );
          failedCount++;
        }

        // Update job progress
        await JobModel.updateProgress(jobId, completedCount, failedCount);
      }

      // Update final job status
      if (failedCount === 0) {
        await JobModel.updateStatus(jobId, 'completed');
        logger.info(`Job ${jobId} completed successfully`);
      } else if (completedCount === 0) {
        await JobModel.updateStatus(jobId, 'failed', {
          message: 'All creatives failed to process',
        });
        logger.error(`Job ${jobId} failed completely`);
      } else {
        await JobModel.updateStatus(jobId, 'completed', {
          message: `Completed with ${failedCount} failures out of ${creativeIds.length}`,
        });
        logger.warn(`Job ${jobId} completed with ${failedCount} failures`);
      }

      return { completedCount, failedCount, total: creativeIds.length };
    } catch (error: any) {
      logger.error(`Job ${jobId} failed:`, error);
      await JobModel.updateStatus(jobId, 'failed', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

// Worker event handlers
worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`, job.returnvalue);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  logger.error('Worker error:', err);
});

// Add job to queue
export const addUploadJob = async (jobData: UploadJobData): Promise<Job<UploadJobData>> => {
  const job = await uploadQueue.add('process-upload', jobData, {
    jobId: `job-${jobData.jobId}`,
  });

  logger.info(`Added job ${job.id} to queue`);
  return job;
};

// Get job status
export const getJobStatus = async (jobId: string) => {
  const job = await uploadQueue.getJob(jobId);
  if (!job) return null;

  return {
    id: job.id,
    progress: await job.getState(),
    progressPercentage: job.progress,
    data: job.data,
  };
};

export default uploadQueue;
