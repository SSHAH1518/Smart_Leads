import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLeadValidator, updateLeadValidator } from '../validators/lead';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getLeads);
router.get('/export/csv', exportLeadsCSV);
router.get('/stats', getLeadStats);
router.get('/:id', getLeadById);
router.post('/', createLeadValidator, validate, createLead);
router.put('/:id', updateLeadValidator, validate, updateLead);
router.delete('/:id', authorize('admin', 'sales_user'), deleteLead);

export default router;
