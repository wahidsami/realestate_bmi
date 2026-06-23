import type { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service.js';
import { clearAuthHintCookie, clearRefreshCookie, setAuthHintCookie, setRefreshCookie } from '../utils/authCookies.js';
import { HttpError } from '../utils/httpError.js';

const authService = new AuthService();

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { identifier, password } = req.body as { identifier: string; password: string };
    const result = await authService.login(identifier, password, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });

    setRefreshCookie(res, result.refreshToken, result.refreshTokenMaxAgeMs);
    setAuthHintCookie(res, result.refreshTokenMaxAgeMs);

    res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      permissions: result.permissions,
      mustChangePassword: result.mustChangePassword,
    });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.bmi_admin_session as string | undefined;

    await authService.logout({
      userId: req.auth?.id,
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });

    clearRefreshCookie(res);
    clearAuthHintCookie(res);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = (req.cookies?.bmi_admin_session || req.body?.refreshToken) as string | undefined;
    if (!token) {
      throw new HttpError(401, 'Missing refresh token');
    }

    const result = await authService.refresh(token, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });

    setRefreshCookie(res, result.refreshToken, result.refreshTokenMaxAgeMs);
    setAuthHintCookie(res, result.refreshTokenMaxAgeMs);
    res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    clearRefreshCookie(res);
    clearAuthHintCookie(res);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new HttpError(401, 'Not authenticated');
    }

    const result = await authService.me(req.auth.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const profile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new HttpError(401, 'Not authenticated');
    }

    const result = await authService.updateProfile(req.auth.id, req.body);
    res.json({ success: true, user: result });
  } catch (error) {
    next(error);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new HttpError(401, 'Not authenticated');
    }

    const result = await authService.changePassword(req.auth.id, req.body.currentPassword, req.body.newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
