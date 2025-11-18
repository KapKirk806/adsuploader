import { Router } from 'express';
import teamController from '../controllers/teamController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all team members
router.get('/', (req, res, next) => {
  teamController.getTeamMembers(req as any, res).catch(next);
});

// Invite team member
router.post('/invite', (req, res, next) => {
  teamController.inviteTeamMember(req as any, res).catch(next);
});

// Update team member
router.put('/:id', (req, res, next) => {
  teamController.updateTeamMember(req as any, res).catch(next);
});

// Remove team member
router.delete('/:id', (req, res, next) => {
  teamController.removeTeamMember(req as any, res).catch(next);
});

export default router;
