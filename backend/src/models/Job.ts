import { query } from '../config/database';
import { UploadJob, CreateJobDTO } from '../types';

export class JobModel {
  /**
   * Create a new upload job
   */
  static async create(data: CreateJobDTO): Promise<UploadJob> {
    const result = await query(
      `INSERT INTO upload_jobs (
        user_id, ad_account_id, template_id, job_type, total_ads
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        data.user_id,
        data.ad_account_id,
        data.template_id || null,
        data.job_type || 'bulk_upload',
        data.total_ads,
      ]
    );

    return result.rows[0];
  }

  /**
   * Find job by ID
   */
  static async findById(id: number): Promise<UploadJob | null> {
    const result = await query('SELECT * FROM upload_jobs WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Find jobs by user ID
   */
  static async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<UploadJob[]> {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM upload_jobs WHERE user_id = $1';
    const params: any[] = [userId];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
      sql += ' ORDER BY created_at DESC LIMIT $3 OFFSET $4';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Update job status
   */
  static async updateStatus(
    id: number,
    status: string,
    errorLog?: any
  ): Promise<UploadJob | null> {
    const completedAt = status === 'completed' || status === 'failed' ? new Date() : null;

    const result = await query(
      `UPDATE upload_jobs
       SET status = $1, error_log = $2, completed_at = $3
       WHERE id = $4
       RETURNING *`,
      [status, errorLog ? JSON.stringify(errorLog) : null, completedAt, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update job progress
   */
  static async updateProgress(
    id: number,
    completedAds: number,
    failedAds: number
  ): Promise<UploadJob | null> {
    const result = await query(
      `UPDATE upload_jobs
       SET completed_ads = $1, failed_ads = $2,
           progress_percentage = CASE
             WHEN total_ads > 0 THEN ROUND(($1::float / total_ads) * 100)
             ELSE 0
           END
       WHERE id = $3
       RETURNING *`,
      [completedAds, failedAds, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Set campaign and adset IDs
   */
  static async setCampaignInfo(
    id: number,
    campaignId: string,
    adsetId: string
  ): Promise<void> {
    await query(
      'UPDATE upload_jobs SET campaign_id = $1, adset_id = $2 WHERE id = $3',
      [campaignId, adsetId, id]
    );
  }

  /**
   * Delete job
   */
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM upload_jobs WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if user owns job
   */
  static async isOwnedByUser(jobId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT id FROM upload_jobs WHERE id = $1 AND user_id = $2',
      [jobId, userId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get job statistics for user
   */
  static async getStats(userId: number): Promise<any> {
    const result = await query(
      `SELECT
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_jobs,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_jobs,
        SUM(total_ads) as total_ads_created,
        SUM(completed_ads) as successful_ads
      FROM upload_jobs
      WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }
}
