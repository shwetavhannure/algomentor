import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createProblem,
  listProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  requestHint,
  analyzeProblem,
  markSolved,
  resetProblem,
} from '../controllers/problemController.js';
import { requireAuth } from '../middleware/auth.js';
import { rejectLongText } from '../middleware/validateLength.js';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Slow down and try again.' },
});

router.use(requireAuth);
router.use(rejectLongText(['statement', 'userCode', 'code']));

router.post('/', rejectLongText(['statement']), createProblem);
router.get('/', listProblems);
router.get('/:id', getProblem);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);
router.post('/:id/hint', aiLimiter, requestHint);
router.post('/:id/analyze', aiLimiter, analyzeProblem);
router.post('/:id/solve', markSolved);
router.post('/:id/reset', resetProblem);

export default router;
