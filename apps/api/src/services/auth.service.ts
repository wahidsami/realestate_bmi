import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { AuthRepository, hashToken } from '../repositories/auth.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { createJti, signAccessToken, signRefreshToken, verifyJwt } from '../utils/jwt.js';
import { HttpError } from '../utils/httpError.js';
import type { SessionDeviceType } from '../types/auth.js';

const authRepository = new AuthRepository();
const auditRepository = new AuditRepository();

const REFRESH_COOKIE_MS = 30 * 24 * 60 * 60 * 1000;
const ACCESS_COOKIE_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

const normalizeUser = (user: any) => {
  if (!user) return null;

  const roles = (user.roles || []).map((userRole: any) => ({
    id: userRole.role.id,
    name: userRole.role.name,
    permissions: (userRole.role.permissions || []).map((item: any) => ({
      key: item.permission.key,
    })),
  }));

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    roles,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    jobTitle: user.jobTitle,
    department: user.department,
    lastLoginAt: user.lastLoginAt,
  };
};

const collectPermissions = (user: any): string[] => {
  const permissionSet = new Set<string>();
  for (const userRole of user.roles || []) {
    for (const item of userRole.role.permissions || []) {
      permissionSet.add(item.permission.key);
    }
  }
  return [...permissionSet];
};

const parseUserAgent = (userAgent?: string | null) => {
  const ua = (userAgent || '').toLowerCase();
  const deviceType: SessionDeviceType = ua.includes('mobile')
    ? 'MOBILE'
    : ua.includes('tablet')
      ? 'TABLET'
      : ua.includes('bot')
        ? 'BOT'
        : ua
          ? 'DESKTOP'
          : 'UNKNOWN';

  const browser = ua.includes('chrome') ? 'Chrome' : ua.includes('firefox') ? 'Firefox' : ua.includes('safari') ? 'Safari' : 'Unknown';
  const operatingSystem = ua.includes('windows') ? 'Windows' : ua.includes('mac os') ? 'macOS' : ua.includes('linux') ? 'Linux' : ua.includes('android') ? 'Android' : ua.includes('iphone') || ua.includes('ios') ? 'iOS' : 'Unknown';

  return { deviceType, browser, operatingSystem };
};

const createTokenPair = (userId: string, sessionId: string) => {
  const jti = createJti();
  const accessToken = signAccessToken({ sub: userId, sid: sessionId, jti, type: 'access' });
  const refreshToken = signRefreshToken({ sub: userId, sid: sessionId, jti, type: 'refresh' });
  return { jti, accessToken, refreshToken };
};

export class AuthService {
  async login(identifier: string, password: string, meta: { ipAddress?: string; userAgent?: string }) {
    const user = await authRepository.findUserByLoginIdentifier(identifier);
    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }

    if (!user.isActive || user.status === 'SUSPENDED' || user.deletedAt) {
      throw new HttpError(403, 'Account is inactive');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new HttpError(423, 'Account temporarily locked');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      const failed = user.failedLoginAttempts + 1;
      const updateData: Record<string, unknown> = {
        failedLoginAttempts: failed,
      };
      if (failed >= MAX_FAILED_LOGINS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      }
      await authRepository.updateUser(user.id, updateData);
      throw new HttpError(401, 'Invalid credentials');
    }

    const session = await authRepository.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      ...parseUserAgent(meta.userAgent),
      loginAt: new Date(),
      lastActivityAt: new Date(),
      isActive: true,
    });

    const tokenPair = createTokenPair(user.id, session.id);
    const refreshToken = await authRepository.createRefreshToken({
      userId: user.id,
      sessionId: session.id,
      tokenHash: hashToken(tokenPair.refreshToken),
      jti: tokenPair.jti,
      expiresAt: new Date(Date.now() + REFRESH_COOKIE_MS),
    });

    await authRepository.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      passwordChangedAt: user.passwordChangedAt || null,
    });

    await auditRepository.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      description: 'User logged in',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      user: normalizeUser(user),
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      sessionId: session.id,
      permissions: collectPermissions(user),
      accessTokenMaxAgeMs: ACCESS_COOKIE_MS,
      refreshTokenMaxAgeMs: REFRESH_COOKIE_MS,
      mustChangePassword: !user.passwordChangedAt,
    };
  }

  async logout(input: { userId?: string; sessionId?: string; refreshToken?: string; ipAddress?: string; userAgent?: string }) {
    if (input.refreshToken) {
      try {
        const payload = verifyJwt(input.refreshToken);
        if (payload.type === 'refresh') {
          if (input.sessionId) {
            await authRepository.revokeSession(input.sessionId);
          } else if (payload.sid) {
            await authRepository.revokeSession(payload.sid);
          }

          const tokenHash = hashToken(input.refreshToken);
          const stored = await authRepository.findRefreshTokenByHash(tokenHash);
          if (stored) {
            await authRepository.revokeRefreshToken(stored.id);
          }
        }
      } catch {
        // Ignore invalid token during logout to keep endpoint idempotent.
      }
    }

    if (input.userId) {
      await auditRepository.log({
        userId: input.userId,
        action: 'USER_LOGOUT',
        entityType: 'Session',
        entityId: input.sessionId,
        description: 'User logged out',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
    }
  }

  async refresh(refreshToken: string, meta: { ipAddress?: string; userAgent?: string }) {
    const payload = verifyJwt(refreshToken);
    if (payload.type !== 'refresh') {
      throw new HttpError(401, 'Invalid token type');
    }

    const storedToken = await authRepository.findRefreshTokenByJti(payload.jti);
    if (!storedToken || storedToken.revokedAt || storedToken.deletedAt) {
      throw new HttpError(401, 'Refresh token revoked');
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      throw new HttpError(401, 'Refresh token expired');
    }

    const session = await authRepository.findSessionById(payload.sid);
    if (!session || !session.isActive) {
      throw new HttpError(401, 'Session inactive');
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new HttpError(401, 'User inactive');
    }

    const rotated = createTokenPair(user.id, session.id);
    const nextRefresh = await authRepository.createRefreshToken({
      userId: user.id,
      sessionId: session.id,
      tokenHash: hashToken(rotated.refreshToken),
      jti: rotated.jti,
      expiresAt: new Date(Date.now() + REFRESH_COOKIE_MS),
    });

    await authRepository.revokeRefreshToken(storedToken.id, nextRefresh.id);
    await authRepository.updateSession(session.id, {
      lastActivityAt: new Date(),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await auditRepository.log({
      userId: user.id,
      action: 'TOKEN_REFRESH',
      entityType: 'Session',
      entityId: session.id,
      description: 'Refresh token rotated',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      user: normalizeUser(user),
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      refreshTokenMaxAgeMs: REFRESH_COOKIE_MS,
      accessTokenMaxAgeMs: ACCESS_COOKIE_MS,
    };
  }

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return {
      user: normalizeUser(user),
      permissions: collectPermissions(user),
    };
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string | null;
    avatar?: string | null;
    jobTitle?: string | null;
    department?: string | null;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  }) {
    await authRepository.updateUser(userId, data);
    const refreshed = await authRepository.findUserById(userId);
    if (!refreshed) {
      throw new HttpError(404, 'User not found');
    }
    return normalizeUser(refreshed);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new HttpError(400, 'Current password is invalid');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await authRepository.updateUser(userId, {
      passwordHash,
      passwordChangedAt: new Date(),
    });
    await authRepository.revokeRefreshTokensByUserId(userId);
    await authRepository.revokeSessionsByUserId(userId);

    await auditRepository.log({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: userId,
      description: 'Password changed',
    });

    return { success: true };
  }

  async forgotPassword(email: string, meta: { ipAddress?: string; userAgent?: string }) {
    const user = await authRepository.findUserByLoginIdentifier(email);
    if (!user) {
      return { success: true };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await auditRepository.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: user.id,
      description: 'Password reset requested',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { success: true, resetToken: rawToken };
  }

  async resetPassword(token: string, newPassword: string, meta: { ipAddress?: string; userAgent?: string }) {
    const tokenHash = hashToken(token);
    const stored = await authRepository.findPasswordResetToken(tokenHash);
    if (!stored || stored.usedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new HttpError(400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await authRepository.updateUser(stored.userId, {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    await authRepository.revokeRefreshTokensByUserId(stored.userId);
    await authRepository.revokeSessionsByUserId(stored.userId);
    await authRepository.usePasswordResetToken(stored.id);

    await auditRepository.log({
      userId: stored.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: stored.userId,
      description: 'Password reset completed',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { success: true };
  }
}
