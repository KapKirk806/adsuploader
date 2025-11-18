import { query } from '../config/database';
import { Creative, CreateCreativeDTO } from '../types';

export class CreativeModel {
  /**
   * Create a new creative
   */
  static async create(data: CreateCreativeDTO): Promise<Creative> {
    const result = await query(
      `INSERT INTO creatives (
        upload_job_id, user_id, file_name, original_file_name,
        file_type, file_size, file_url, width, height, aspect_ratio,
        duration, variation_group, variation_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        data.upload_job_id,
        data.user_id,
        data.file_name,
        data.original_file_name,
        data.file_type,
        data.file_size,
        data.file_url,
        data.width,
        data.height,
        data.aspect_ratio,
        data.duration || null,
        data.variation_group || null,
        data.variation_number || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Bulk create creatives
   */
  static async bulkCreate(creatives: CreateCreativeDTO[]): Promise<Creative[]> {
    if (creatives.length === 0) return [];

    const values: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    creatives.forEach((creative) => {
      const valueClause = `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${
        paramIndex + 3
      }, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${
        paramIndex + 7
      }, $${paramIndex + 8}, $${paramIndex + 9}, $${paramIndex + 10}, $${
        paramIndex + 11
      }, $${paramIndex + 12})`;
      values.push(valueClause);

      params.push(
        creative.upload_job_id,
        creative.user_id,
        creative.file_name,
        creative.original_file_name,
        creative.file_type,
        creative.file_size,
        creative.file_url,
        creative.width,
        creative.height,
        creative.aspect_ratio,
        creative.duration || null,
        creative.variation_group || null,
        creative.variation_number || null
      );

      paramIndex += 13;
    });

    const result = await query(
      `INSERT INTO creatives (
        upload_job_id, user_id, file_name, original_file_name,
        file_type, file_size, file_url, width, height, aspect_ratio,
        duration, variation_group, variation_number
      ) VALUES ${values.join(', ')}
      RETURNING *`,
      params
    );

    return result.rows;
  }

  /**
   * Find creative by ID
   */
  static async findById(id: number): Promise<Creative | null> {
    const result = await query('SELECT * FROM creatives WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Find creatives by job ID
   */
  static async findByJobId(jobId: number): Promise<Creative[]> {
    const result = await query(
      'SELECT * FROM creatives WHERE upload_job_id = $1 ORDER BY variation_group, variation_number',
      [jobId]
    );
    return result.rows;
  }

  /**
   * Find creatives by variation group
   */
  static async findByVariationGroup(
    jobId: number,
    variationGroup: string
  ): Promise<Creative[]> {
    const result = await query(
      'SELECT * FROM creatives WHERE upload_job_id = $1 AND variation_group = $2 ORDER BY variation_number',
      [jobId, variationGroup]
    );
    return result.rows;
  }

  /**
   * Update creative status
   */
  static async updateStatus(
    id: number,
    status: string,
    errorMessage?: string
  ): Promise<Creative | null> {
    const result = await query(
      'UPDATE creatives SET status = $1, error_message = $2 WHERE id = $3 RETURNING *',
      [status, errorMessage || null, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update Facebook creative and ad IDs
   */
  static async updateFacebookIds(
    id: number,
    creativeId: string,
    adId?: string
  ): Promise<void> {
    await query(
      'UPDATE creatives SET facebook_creative_id = $1, facebook_ad_id = $2 WHERE id = $3',
      [creativeId, adId || null, id]
    );
  }

  /**
   * Set thumbnail URL
   */
  static async setThumbnail(id: number, thumbnailUrl: string): Promise<void> {
    await query('UPDATE creatives SET thumbnail_url = $1 WHERE id = $2', [
      thumbnailUrl,
      id,
    ]);
  }

  /**
   * Delete creative
   */
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM creatives WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get variation groups for a job
   */
  static async getVariationGroups(jobId: number): Promise<string[]> {
    const result = await query(
      'SELECT DISTINCT variation_group FROM creatives WHERE upload_job_id = $1 AND variation_group IS NOT NULL ORDER BY variation_group',
      [jobId]
    );

    return result.rows.map((row) => row.variation_group);
  }
}
