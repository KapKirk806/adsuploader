import { query } from '../config/database';
import { User, CreateUserDTO } from '../types';
import bcrypt from 'bcrypt';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: CreateUserDTO): Promise<User> {
    const hashedPassword = userData.access_token
      ? await bcrypt.hash(userData.access_token, 10)
      : null;

    const result = await query(
      `INSERT INTO users (
        facebook_id, email, name, avatar_url,
        access_token, refresh_token, token_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        userData.facebook_id || null,
        userData.email,
        userData.name || null,
        userData.avatar_url || null,
        hashedPassword,
        userData.refresh_token || null,
        userData.token_expires_at || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by Facebook ID
   */
  static async findByFacebookId(facebookId: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE facebook_id = $1', [
      facebookId,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Update user
   */
  static async update(id: number, updates: Partial<User>): Promise<User | null> {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = Object.values(updates);

    const result = await query(
      `UPDATE users SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Update user tokens
   */
  static async updateTokens(
    id: number,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(accessToken, 10);

    await query(
      `UPDATE users
       SET access_token = $1, refresh_token = $2, token_expires_at = $3
       WHERE id = $4`,
      [hashedToken, refreshToken || null, expiresAt || null, id]
    );
  }

  /**
   * Delete user
   */
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * List all users (admin only)
   */
  static async list(page: number = 1, limit: number = 10): Promise<User[]> {
    const offset = (page - 1) * limit;

    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows;
  }

  /**
   * Count total users
   */
  static async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }
}
