import { Router } from 'express';
import {
  register,
  login,
  me,
  googleAuth,
  updateProfile,
  updateSettings,
  updatePreferences,
  deleteAccount,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', requireAuth, me);
router.put('/profile', requireAuth, updateProfile);
router.put('/settings', requireAuth, updateSettings);
router.put('/preferences', requireAuth, updatePreferences);
router.delete('/account', requireAuth, deleteAccount);

export default router;
