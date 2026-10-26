import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { guestHint, guestAnalyze } from '../controllers/guestController.js';
import { rejectLongText } from '../middleware/validateLength.js';

const router = Router();

const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many guest requests. Try again in an hour or sign up.' },
});

router.use(guestLimiter);
router.use(rejectLongText(['statement', 'code']));

router.post('/hint', guestHint);
router.post('/analyze', guestAnalyze);

export default router;
