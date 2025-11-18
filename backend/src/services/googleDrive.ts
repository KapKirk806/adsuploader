/**
 * Google Drive Integration Service
 * Handles OAuth authentication and file operations
 */

import axios from 'axios';
import logger from '../config/logger';
import { pool } from '../config/database';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  modifiedTime: string;
}

class GoogleDriveService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google-drive/callback';
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      });

      logger.info('Google tokens obtained successfully');
      return response.data;
    } catch (error: any) {
      logger.error('Error getting Google tokens:', error.response?.data || error.message);
      throw new Error('Failed to get Google tokens');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      });

      return response.data.access_token;
    } catch (error: any) {
      logger.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * List files from Google Drive
   */
  async listFiles(
    accessToken: string,
    folderId?: string,
    pageToken?: string
  ): Promise<{
    files: GoogleDriveFile[];
    nextPageToken?: string;
  }> {
    try {
      const params: any = {
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType, size, thumbnailLink, webContentLink, modifiedTime)',
        orderBy: 'modifiedTime desc',
      };

      // Filter for images and videos only
      let query = "(mimeType contains 'image/' or mimeType contains 'video/')";

      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      params.q = query;

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });

      logger.info(`Listed ${response.data.files?.length || 0} files from Google Drive`);

      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: any) {
      logger.error('Error listing Drive files:', error.response?.data || error.message);
      throw new Error('Failed to list Google Drive files');
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string, accessToken: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            alt: 'media',
          },
          responseType: 'arraybuffer',
        }
      );

      logger.info(`Downloaded file ${fileId} from Google Drive`);
      return Buffer.from(response.data);
    } catch (error: any) {
      logger.error('Error downloading file:', error.response?.data || error.message);
      throw new Error('Failed to download file from Google Drive');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string, accessToken: string): Promise<GoogleDriveFile> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'id, name, mimeType, size, thumbnailLink, webContentLink, modifiedTime',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Error getting file metadata:', error.response?.data || error.message);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Save Google Drive connection to database
   */
  async saveConnection(
    userId: number,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    email: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await pool.query(
      `INSERT INTO google_drive_connections (user_id, access_token, refresh_token, token_expires_at, email)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         token_expires_at = $4,
         email = $5,
         is_active = true,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, accessToken, refreshToken, expiresAt, email]
    );

    logger.info(`Saved Google Drive connection for user ${userId}`);
  }

  /**
   * Get user's Google Drive connection
   */
  async getConnection(userId: number): Promise<{
    access_token: string;
    refresh_token: string;
    token_expires_at: Date;
    email: string;
  } | null> {
    const result = await pool.query(
      'SELECT access_token, refresh_token, token_expires_at, email FROM google_drive_connections WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if token is expired and refresh if needed
   */
  async ensureValidToken(userId: number): Promise<string> {
    const connection = await this.getConnection(userId);

    if (!connection) {
      throw new Error('Google Drive not connected');
    }

    const now = new Date();
    const expiresAt = new Date(connection.token_expires_at);

    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      logger.info('Refreshing Google Drive access token');
      const newAccessToken = await this.refreshAccessToken(connection.refresh_token);

      // Update token in database
      await pool.query(
        'UPDATE google_drive_connections SET access_token = $1, token_expires_at = $2 WHERE user_id = $3',
        [newAccessToken, new Date(Date.now() + 3600 * 1000), userId]
      );

      return newAccessToken;
    }

    return connection.access_token;
  }
}

export default new GoogleDriveService();
