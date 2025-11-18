/**
 * Meta Marketing API Service
 *
 * This service handles all interactions with the Meta (Facebook) Marketing API.
 * In development mode (without real credentials), it uses mocked responses.
 */

import axios, { AxiosInstance } from 'axios';
import logger from '../config/logger';
import {
  MetaCampaignResponse,
  MetaAdSetResponse,
  MetaAdResponse,
  MetaImageUploadResponse,
  MetaVideoUploadResponse,
  CampaignConfig,
  AdSetConfig,
  AdConfig,
} from '../types';

class MetaAPIService {
  private client: AxiosInstance;
  private apiVersion: string;
  private isMockMode: boolean;

  constructor() {
    this.apiVersion = process.env.META_API_VERSION || 'v18.0';
    const baseURL = process.env.META_API_BASE_URL || 'https://graph.facebook.com';

    // Check if we're in mock mode (no credentials)
    this.isMockMode = !process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET;

    this.client = axios.create({
      baseURL: `${baseURL}/${this.apiVersion}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (this.isMockMode) {
      logger.info('⚠️  Meta API running in MOCK MODE (no credentials configured)');
    }
  }

  /**
   * Create a campaign
   */
  async createCampaign(
    adAccountId: string,
    campaignData: CampaignConfig,
    accessToken: string
  ): Promise<MetaCampaignResponse> {
    if (this.isMockMode) {
      return this.mockCreateCampaign(campaignData);
    }

    try {
      const response = await this.client.post(
        `/${adAccountId}/campaigns`,
        campaignData,
        {
          params: { access_token: accessToken },
        }
      );

      logger.info(`Campaign created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error creating campaign:', error.response?.data || error.message);
      throw new Error(`Failed to create campaign: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create an ad set
   */
  async createAdSet(
    adAccountId: string,
    adSetData: AdSetConfig,
    accessToken: string
  ): Promise<MetaAdSetResponse> {
    if (this.isMockMode) {
      return this.mockCreateAdSet(adSetData);
    }

    try {
      const response = await this.client.post(
        `/${adAccountId}/adsets`,
        adSetData,
        {
          params: { access_token: accessToken },
        }
      );

      logger.info(`Ad Set created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error creating ad set:', error.response?.data || error.message);
      throw new Error(`Failed to create ad set: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Upload image
   */
  async uploadImage(
    adAccountId: string,
    imageData: Buffer | string,
    filename: string,
    accessToken: string
  ): Promise<MetaImageUploadResponse> {
    if (this.isMockMode) {
      return this.mockUploadImage(filename);
    }

    try {
      const formData = new FormData();
      formData.append('filename', filename);

      if (Buffer.isBuffer(imageData)) {
        formData.append('bytes', new Blob([imageData]));
      } else {
        formData.append('url', imageData);
      }

      const response = await this.client.post(
        `/${adAccountId}/adimages`,
        formData,
        {
          params: { access_token: accessToken },
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      logger.info(`Image uploaded: ${filename}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error uploading image:', error.response?.data || error.message);
      throw new Error(`Failed to upload image: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Upload video
   */
  async uploadVideo(
    adAccountId: string,
    videoUrl: string,
    title: string,
    accessToken: string
  ): Promise<MetaVideoUploadResponse> {
    if (this.isMockMode) {
      return this.mockUploadVideo(title);
    }

    try {
      const response = await this.client.post(
        `/${adAccountId}/advideos`,
        {
          file_url: videoUrl,
          title,
        },
        {
          params: { access_token: accessToken },
        }
      );

      logger.info(`Video uploaded: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error uploading video:', error.response?.data || error.message);
      throw new Error(`Failed to upload video: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create ad creative
   */
  async createAdCreative(
    adAccountId: string,
    creativeData: any,
    accessToken: string
  ): Promise<{ id: string }> {
    if (this.isMockMode) {
      return this.mockCreateAdCreative();
    }

    try {
      const response = await this.client.post(
        `/${adAccountId}/adcreatives`,
        creativeData,
        {
          params: { access_token: accessToken },
        }
      );

      logger.info(`Ad Creative created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error creating ad creative:', error.response?.data || error.message);
      throw new Error(`Failed to create ad creative: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create ad
   */
  async createAd(
    adAccountId: string,
    adData: any,
    accessToken: string
  ): Promise<MetaAdResponse> {
    if (this.isMockMode) {
      return this.mockCreateAd(adData);
    }

    try {
      const response = await this.client.post(
        `/${adAccountId}/ads`,
        adData,
        {
          params: { access_token: accessToken },
        }
      );

      logger.info(`Ad created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error creating ad:', error.response?.data || error.message);
      throw new Error(`Failed to create ad: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get ad accounts
   */
  async getAdAccounts(userId: string, accessToken: string): Promise<any[]> {
    if (this.isMockMode) {
      return this.mockGetAdAccounts();
    }

    try {
      const response = await this.client.get(`/${userId}/adaccounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,currency,timezone_name,account_status',
        },
      });

      return response.data.data || [];
    } catch (error: any) {
      logger.error('Error fetching ad accounts:', error.response?.data || error.message);
      throw new Error(`Failed to fetch ad accounts: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // ============= MOCK METHODS =============

  private mockCreateCampaign(data: CampaignConfig): MetaCampaignResponse {
    logger.info('MOCK: Creating campaign', data);
    return {
      id: `mock_campaign_${Date.now()}`,
      name: data.name,
      status: data.status,
    };
  }

  private mockCreateAdSet(data: AdSetConfig): MetaAdSetResponse {
    logger.info('MOCK: Creating ad set', data);
    return {
      id: `mock_adset_${Date.now()}`,
      name: data.name,
      status: data.status,
    };
  }

  private mockUploadImage(filename: string): MetaImageUploadResponse {
    logger.info('MOCK: Uploading image', filename);
    return {
      images: {
        [filename]: {
          hash: `mock_hash_${Date.now()}`,
          url: `https://mock-cdn.example.com/${filename}`,
        },
      },
    };
  }

  private mockUploadVideo(title: string): MetaVideoUploadResponse {
    logger.info('MOCK: Uploading video', title);
    return {
      id: `mock_video_${Date.now()}`,
      title,
    };
  }

  private mockCreateAdCreative(): { id: string } {
    logger.info('MOCK: Creating ad creative');
    return {
      id: `mock_creative_${Date.now()}`,
    };
  }

  private mockCreateAd(data: any): MetaAdResponse {
    logger.info('MOCK: Creating ad', data);
    return {
      id: `mock_ad_${Date.now()}`,
      name: data.name,
      status: data.status,
    };
  }

  private mockGetAdAccounts(): any[] {
    logger.info('MOCK: Getting ad accounts');
    return [
      {
        id: 'act_mock123456',
        name: 'Mock Ad Account 1',
        currency: 'USD',
        timezone_name: 'America/Los_Angeles',
        account_status: 1,
      },
      {
        id: 'act_mock789012',
        name: 'Mock Ad Account 2',
        currency: 'USD',
        timezone_name: 'America/New_York',
        account_status: 1,
      },
    ];
  }
}

export default new MetaAPIService();
