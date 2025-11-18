import { query } from '../config/database';
import { CampaignTemplate } from '../types';

export class TemplateModel {
  /**
   * Create a new campaign template
   */
  static async create(data: {
    user_id: number;
    name: string;
    description?: string;
    objective: string;
    campaign_config: any;
    adset_config: any;
    ad_config: any;
    is_default?: boolean;
  }): Promise<CampaignTemplate> {
    const result = await query(
      `INSERT INTO campaign_templates (
        user_id, name, description, objective,
        campaign_config, adset_config, ad_config, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.user_id,
        data.name,
        data.description || null,
        data.objective,
        JSON.stringify(data.campaign_config),
        JSON.stringify(data.adset_config),
        JSON.stringify(data.ad_config),
        data.is_default || false,
      ]
    );

    return result.rows[0];
  }

  /**
   * Find template by ID
   */
  static async findById(id: number): Promise<CampaignTemplate | null> {
    const result = await query(
      'SELECT * FROM campaign_templates WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find templates by user ID
   */
  static async findByUserId(userId: number): Promise<CampaignTemplate[]> {
    const result = await query(
      'SELECT * FROM campaign_templates WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  /**
   * Find default template for user
   */
  static async findDefaultByUserId(
    userId: number
  ): Promise<CampaignTemplate | null> {
    const result = await query(
      'SELECT * FROM campaign_templates WHERE user_id = $1 AND is_default = true LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update template
   */
  static async update(
    id: number,
    updates: Partial<CampaignTemplate>
  ): Promise<CampaignTemplate | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 2;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'campaign_config' || key === 'adset_config' || key === 'ad_config') {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    });

    const result = await query(
      `UPDATE campaign_templates SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Set template as default (unset others)
   */
  static async setAsDefault(id: number, userId: number): Promise<void> {
    // Unset all other defaults for this user
    await query(
      'UPDATE campaign_templates SET is_default = false WHERE user_id = $1',
      [userId]
    );

    // Set this template as default
    await query(
      'UPDATE campaign_templates SET is_default = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  /**
   * Delete template
   */
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM campaign_templates WHERE id = $1', [
      id,
    ]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if user owns template
   */
  static async isOwnedByUser(templateId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT id FROM campaign_templates WHERE id = $1 AND user_id = $2',
      [templateId, userId]
    );
    return result.rows.length > 0;
  }
}
