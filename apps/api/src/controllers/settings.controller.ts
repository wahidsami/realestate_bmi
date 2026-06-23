import type { RequestHandler } from 'express';
import { SettingsService } from '../services/settings.service.js';
import { HttpError } from '../utils/httpError.js';

const settingsService = new SettingsService();

export const getSettings: RequestHandler = async (_req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new HttpError(401, 'Not authenticated');
    }

    const settings = await settingsService.updateSettings(req.body as Record<string, unknown>);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};
