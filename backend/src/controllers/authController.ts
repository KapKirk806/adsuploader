import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { UserModel } from '../models/User';
import authService from '../services/authService';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await UserModel.create({
        email,
        name,
        access_token: hashedPassword, // Temporary: storing password in access_token field
      });

      // Generate JWT token
      const token = authService.generateToken(user);

      logger.info(`User registered: ${user.email}`);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to register user', 500);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.access_token || '');
      if (!isValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = authService.generateToken(user);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to login', 500);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get user', 500);
    }
  }

  /**
   * Initiate Facebook OAuth
   */
  async facebookAuth(req: Request, res: Response) {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${
      process.env.FACEBOOK_APP_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback'
    )}&scope=email,public_profile,ads_management,ads_read,business_management&response_type=code`;

    res.json({ authUrl });
  }

  /**
   * Facebook OAuth callback
   */
  async facebookCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        throw new AppError('Authorization code missing', 400);
      }

      // Exchange code for access token
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}`
      );

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new AppError('Failed to get access token', 400);
      }

      // Get user profile
      const profileResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
      );

      const profile = await profileResponse.json();

      // Find or create user
      let user = await UserModel.findByFacebookId(profile.id);

      const tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000);

      if (user) {
        // Update existing user
        await UserModel.updateTokens(
          user.id,
          tokenData.access_token,
          tokenData.access_token,
          tokenExpiresAt
        );
        user = await UserModel.findById(user.id);
      } else {
        // Create new user
        user = await UserModel.create({
          facebook_id: profile.id,
          email: profile.email || `${profile.id}@facebook.com`,
          name: profile.name,
          avatar_url: profile.picture?.data?.url,
          access_token: tokenData.access_token,
          refresh_token: tokenData.access_token,
          token_expires_at: tokenExpiresAt,
        });
      }

      // Generate JWT token
      const jwtToken = authService.generateToken(user!);

      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth/callback?token=${jwtToken}`);
    } catch (error) {
      logger.error('Facebook OAuth callback error:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }

  /**
   * Logout user
   */
  async logout(req: AuthRequest, res: Response) {
    try {
      // In a real implementation, you might want to blacklist the token
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      throw new AppError('Failed to logout', 500);
    }
  }
}

export default new AuthController();
