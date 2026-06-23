import type { RequestHandler } from 'express';
import { AuthRepository } from '../repositories/auth.repository.js';
import { HttpError } from '../utils/httpError.js';
import { verifyJwt } from '../utils/jwt.js';

const authRepository = new AuthRepository();

const collectPermissions = (user: any): string[] => {
  const permissions = new Set<string>();
  for (const userRole of user.roles || []) {
    for (const link of userRole.role.permissions || []) {
      permissions.add(link.permission.key);
    }
  }
  return [...permissions];
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    next(new HttpError(401, 'Missing access token'));
    return;
  }

  try {
    const payload = verifyJwt(token);
    if (payload.type !== 'access') {
      next(new HttpError(401, 'Invalid token type'));
      return;
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isActive || user.deletedAt) {
      next(new HttpError(401, 'User is not active'));
      return;
    }

    req.auth = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      roles: (user.roles || []).map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        permissions: (userRole.role.permissions || []).map((item: any) => ({ key: item.permission.key })),
      })),
    };
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired access token'));
  }
};

export const authorize = (...requiredPermissions: string[]): RequestHandler => {
  return (req, _res, next) => {
    const permissions = new Set<string>();
    for (const role of req.auth?.roles || []) {
      for (const permission of role.permissions) {
        permissions.add(permission.key);
      }
    }

    const isAllowed = requiredPermissions.some((permission) => permissions.has(permission));
    if (!isAllowed) {
      next(new HttpError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
};
