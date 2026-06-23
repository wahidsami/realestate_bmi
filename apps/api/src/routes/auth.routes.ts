import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  profile,
  refresh,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';

export const authRouter = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

authRouter.post('/login', loginRateLimit as any, validateBody(loginSchema) as any, login as any);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema) as any, forgotPassword as any);
authRouter.post('/reset-password', validateBody(resetPasswordSchema) as any, resetPassword as any);
authRouter.get('/me', authenticate as any, me as any);
authRouter.patch('/profile', authenticate as any, validateBody(updateProfileSchema) as any, profile as any);
authRouter.patch('/change-password', authenticate as any, validateBody(changePasswordSchema) as any, changePassword as any);
