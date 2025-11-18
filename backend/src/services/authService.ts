import jwt from 'jsonwebtoken';
import { User } from '../types';
import { UserModel } from '../models/User';
import logger from '../config/logger';

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Generate JWT token
   */
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Handle Facebook OAuth callback
   */
  async handleFacebookAuth(profile: any, accessToken: string, refreshToken: string): Promise<User> {
    const facebookId = profile.id;
    const email = profile.emails?.[0]?.value || `${facebookId}@facebook.com`;
    const name = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;

    // Calculate token expiry (Facebook tokens typically expire in 60 days)
    const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Check if user exists
    let user = await UserModel.findByFacebookId(facebookId);

    if (user) {
      // Update existing user's tokens
      await UserModel.updateTokens(user.id, accessToken, refreshToken, tokenExpiresAt);
      user = await UserModel.findById(user.id);
    } else {
      // Create new user
      user = await UserModel.create({
        facebook_id: facebookId,
        email,
        name,
        avatar_url: avatarUrl,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
      });
    }

    logger.info(`User authenticated via Facebook: ${user!.email}`);
    return user!;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(userId: number): Promise<string> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // In production, you would implement Facebook token refresh here
    // For now, just generate a new JWT
    return this.generateToken(user);
  }
}

export default new AuthService();
