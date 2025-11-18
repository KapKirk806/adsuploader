import { query } from '../config/database';
import { AdAccount } from '../types';

export class AdAccountModel {
  /**
   * Create a new ad account
   */
  static async create(data: {
    user_id: number;
    facebook_ad_account_id: string;
    name: string;
    currency?: string;
    timezone?: string;
    account_status?: string;
  }): Promise<AdAccount> {
    const result = await query(
      `INSERT INTO ad_accounts (
        user_id, facebook_ad_account_id, name, currency, timezone, account_status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        data.user_id,
        data.facebook_ad_account_id,
        data.name,
        data.currency || 'USD',
        data.timezone || 'UTC',
        data.account_status || 'ACTIVE',
      ]
    );

    return result.rows[0];
  }

  /**
   * Find ad account by ID
   */
  static async findById(id: number): Promise<AdAccount | null> {
    const result = await query('SELECT * FROM ad_accounts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Find ad accounts by user ID
   */
  static async findByUserId(userId: number): Promise<AdAccount[]> {
    const result = await query(
      'SELECT * FROM ad_accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  /**
   * Find ad account by Facebook ID
   */
  static async findByFacebookId(
    userId: number,
    facebookAdAccountId: string
  ): Promise<AdAccount | null> {
    const result = await query(
      'SELECT * FROM ad_accounts WHERE user_id = $1 AND facebook_ad_account_id = $2',
      [userId, facebookAdAccountId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update ad account
   */
  static async update(
    id: number,
    updates: Partial<AdAccount>
  ): Promise<AdAccount | null> {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = Object.values(updates);

    const result = await query(
      `UPDATE ad_accounts SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete ad account
   */
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM ad_accounts WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if user owns ad account
   */
  static async isOwnedByUser(
    accountId: number,
    userId: number
  ): Promise<boolean> {
    const result = await query(
      'SELECT id FROM ad_accounts WHERE id = $1 AND user_id = $2',
      [accountId, userId]
    );
    return result.rows.length > 0;
  }
}
