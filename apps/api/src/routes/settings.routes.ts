import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';

export const settingsRouter = Router();

settingsRouter.get('/', getSettings);
settingsRouter.patch('/', authenticate, authorize('settings.edit'), updateSettings);
