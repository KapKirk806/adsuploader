import { Response } from 'express';
import { AuthRequest } from '../types';
import { pool } from '../config/database';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class TeamController {
  /**
   * Get all team members for the current user's team
   */
  async getTeamMembers(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const result = await pool.query(
        `SELECT
          tm.id,
          tm.user_id,
          u.name,
          u.email,
          u.avatar_url,
          tm.role,
          tm.status,
          tm.invited_by,
          tm.created_at
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.user_id = $1 OR tm.invited_by = $1
        ORDER BY tm.created_at DESC`,
        [req.user.id]
      );

      res.json({ members: result.rows });
    } catch (error) {
      logger.error('Get team members error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get team members', 500);
    }
  }

  /**
   * Invite a team member
   */
  async inviteTeamMember(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { email, role } = req.body;

      // Check if user exists
      const userResult = await pool.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found. They must register first.', 404);
      }

      const invitedUser = userResult.rows[0];

      // Check if already a team member
      const existingMember = await pool.query(
        'SELECT id FROM team_members WHERE user_id = $1 AND invited_by = $2',
        [invitedUser.id, req.user.id]
      );

      if (existingMember.rows.length > 0) {
        throw new AppError('User is already a team member', 400);
      }

      // Create team member
      const result = await pool.query(
        `INSERT INTO team_members (user_id, role, invited_by, status)
        VALUES ($1, $2, $3, 'active')
        RETURNING *`,
        [invitedUser.id, role, req.user.id]
      );

      logger.info(`Team member invited: ${email} by ${req.user.email}`);

      res.status(201).json({
        message: 'Team member invited successfully',
        member: {
          ...result.rows[0],
          name: invitedUser.name,
          email: invitedUser.email,
        },
      });
    } catch (error) {
      logger.error('Invite team member error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to invite team member', 500);
    }
  }

  /**
   * Update team member role
   */
  async updateTeamMember(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;
      const { role, status } = req.body;

      const result = await pool.query(
        `UPDATE team_members
        SET role = COALESCE($1, role),
            status = COALESCE($2, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND invited_by = $4
        RETURNING *`,
        [role, status, id, req.user.id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Team member not found or unauthorized', 404);
      }

      logger.info(`Team member updated: ${id}`);

      res.json({
        message: 'Team member updated successfully',
        member: result.rows[0],
      });
    } catch (error) {
      logger.error('Update team member error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update team member', 500);
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM team_members WHERE id = $1 AND invited_by = $2 RETURNING *',
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Team member not found or unauthorized', 404);
      }

      logger.info(`Team member removed: ${id}`);

      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      logger.error('Remove team member error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove team member', 500);
    }
  }
}

export default new TeamController();
