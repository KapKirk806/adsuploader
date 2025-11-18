import { Response } from 'express';
import { AuthRequest } from '../types';
import googleDriveService from '../services/googleDrive';
import { JobModel } from '../models/Job';
import { CreativeModel } from '../models/Creative';
import { getImageMetadata, getVideoMetadata } from '../utils/fileProcessor';
import { extractVariationInfo } from '../utils/variationDetector';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class GoogleDriveController {
  /**
   * Initiate Google Drive OAuth flow
   */
  async connect(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const authUrl = googleDriveService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      logger.error('Google Drive connect error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate auth URL', 500);
    }
  }

  /**
   * Handle OAuth callback
   */
  async callback(req: AuthRequest, res: Response) {
    try {
      const { code, state } = req.query;

      if (!code || typeof code !== 'string') {
        throw new AppError('Authorization code missing', 400);
      }

      // Exchange code for tokens
      const tokens = await googleDriveService.getTokens(code);

      // Get user email from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await userInfoResponse.json();

      // Save connection (using mock user ID 1 for now)
      await googleDriveService.saveConnection(
        1, // TODO: Use actual user ID from session
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in,
        userInfo.email
      );

      // Redirect to frontend
      res.redirect(`http://localhost:3000/upload?google_drive=connected`);
    } catch (error) {
      logger.error('Google Drive callback error:', error);
      res.redirect(`http://localhost:3000/upload?google_drive=error`);
    }
  }

  /**
   * List files from Google Drive
   */
  async listFiles(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { folderId, pageToken } = req.query;

      // Get valid access token
      const accessToken = await googleDriveService.ensureValidToken(req.user.id);

      // List files
      const result = await googleDriveService.listFiles(
        accessToken,
        folderId as string,
        pageToken as string
      );

      res.json(result);
    } catch (error) {
      logger.error('List Google Drive files error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to list Google Drive files', 500);
    }
  }

  /**
   * Import files from Google Drive
   */
  async importFiles(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { fileIds, ad_account_id, template_id } = req.body;

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        throw new AppError('No files selected', 400);
      }

      if (!ad_account_id) {
        throw new AppError('Ad account ID required', 400);
      }

      // Get valid access token
      const accessToken = await googleDriveService.ensureValidToken(req.user.id);

      // Create upload job
      const job = await JobModel.create({
        user_id: req.user.id,
        ad_account_id: parseInt(ad_account_id),
        template_id: template_id ? parseInt(template_id) : undefined,
        total_ads: fileIds.length,
      });

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Download and process each file
      const creativePromises = fileIds.map(async (fileId: string) => {
        try {
          // Get file metadata
          const metadata = await googleDriveService.getFileMetadata(fileId, accessToken);

          // Download file
          const fileBuffer = await googleDriveService.downloadFile(fileId, accessToken);

          // Save to local storage
          const ext = path.extname(metadata.name);
          const fileName = `${uuidv4()}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, fileBuffer);

          // Get file metadata
          const fileType = metadata.mimeType.startsWith('image/') ? 'image' : 'video';
          const fileMetadata = fileType === 'image'
            ? await getImageMetadata(filePath)
            : await getVideoMetadata(filePath);

          // Extract variation info
          const variationInfo = extractVariationInfo(metadata.name);

          // Create creative record
          return CreativeModel.create({
            upload_job_id: job.id,
            user_id: req.user!.id,
            file_name: fileName,
            original_file_name: metadata.name,
            file_type: fileType,
            file_size: parseInt(metadata.size || '0'),
            file_url: `/uploads/${fileName}`,
            width: fileMetadata.width,
            height: fileMetadata.height,
            aspect_ratio: fileMetadata.aspectRatio,
            duration: fileMetadata.duration,
            variation_group: variationInfo?.group,
            variation_number: variationInfo?.number,
          });
        } catch (error) {
          logger.error(`Error importing file ${fileId}:`, error);
          return null;
        }
      });

      const creatives = (await Promise.all(creativePromises)).filter((c) => c !== null);

      logger.info(`Imported ${creatives.length} files from Google Drive for job ${job.id}`);

      res.status(201).json({
        message: 'Files imported successfully from Google Drive',
        job: {
          id: job.id,
          status: job.status,
          total_ads: job.total_ads,
          created_at: job.created_at,
        },
        creatives: creatives.map((c) => ({
          id: c!.id,
          filename: c!.original_file_name,
          type: c!.file_type,
          aspect_ratio: c!.aspect_ratio,
          variation_group: c!.variation_group,
        })),
      });
    } catch (error) {
      logger.error('Import Google Drive files error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to import files from Google Drive', 500);
    }
  }

  /**
   * Check connection status
   */
  async checkConnection(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const connection = await googleDriveService.getConnection(req.user.id);

      if (!connection) {
        return res.json({ connected: false });
      }

      res.json({
        connected: true,
        email: connection.email,
      });
    } catch (error) {
      logger.error('Check Google Drive connection error:', error);
      res.json({ connected: false });
    }
  }
}

export default new GoogleDriveController();
