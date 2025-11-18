import { Response } from 'express';
import { AuthRequest } from '../types';
import { AdAccountModel } from '../models/AdAccount';
import metaApi from '../services/metaApi';
import { UserModel } from '../models/User';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class AdAccountController {
  /**
   * List user's ad accounts
   */
  async listAccounts(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const accounts = await AdAccountModel.findByUserId(req.user.id);

      res.json({ accounts });
    } catch (error) {
      logger.error('List ad accounts error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to list ad accounts', 500);
    }
  }

  /**
   * Fetch ad accounts from Meta
   */
  async fetchFromMeta(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Get user with access token
      const user = await UserModel.findById(req.user.id);
      if (!user || !user.access_token) {
        throw new AppError('Meta access token not found. Please connect Facebook.', 401);
      }

      // Fetch ad accounts from Meta
      const metaAccounts = await metaApi.getAdAccounts('me', user.access_token);

      // Save to database
      const savedAccounts = [];
      for (const account of metaAccounts) {
        const existing = await AdAccountModel.findByFacebookId(
          req.user.id,
          account.id
        );

        if (!existing) {
          const saved = await AdAccountModel.create({
            user_id: req.user.id,
            facebook_ad_account_id: account.id,
            name: account.name,
            currency: account.currency || 'USD',
            timezone: account.timezone_name || 'UTC',
            account_status: account.account_status === 1 ? 'ACTIVE' : 'DISABLED',
          });
          savedAccounts.push(saved);
        } else {
          savedAccounts.push(existing);
        }
      }

      logger.info(`Fetched ${savedAccounts.length} ad accounts for user ${req.user.id}`);

      res.json({
        message: 'Ad accounts synced successfully',
        accounts: savedAccounts,
      });
    } catch (error) {
      logger.error('Fetch ad accounts error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch ad accounts from Meta', 500);
    }
  }

  /**
   * Get ad account by ID
   */
  async getAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const account = await AdAccountModel.findById(parseInt(id));

      if (!account) {
        throw new AppError('Ad account not found', 404);
      }

      if (account.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      res.json({ account });
    } catch (error) {
      logger.error('Get ad account error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get ad account', 500);
    }
  }

  /**
   * Delete ad account
   */
  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const account = await AdAccountModel.findById(parseInt(id));

      if (!account) {
        throw new AppError('Ad account not found', 404);
      }

      if (account.user_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
      }

      await AdAccountModel.delete(parseInt(id));

      res.json({ message: 'Ad account removed successfully' });
    } catch (error) {
      logger.error('Delete ad account error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete ad account', 500);
    }
  }
}

export default new AdAccountController();
