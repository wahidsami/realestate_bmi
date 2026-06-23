import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export class AuthRepository {
  async findUserByLoginIdentifier(identifier: string) {
    return prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier },
        ],
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateUser(userId: string, data: Record<string, unknown>) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async createSession(data: Parameters<typeof prisma.session.create>[0]['data']) {
    return prisma.session.create({ data });
  }

  async updateSession(sessionId: string, data: Record<string, unknown>) {
    return prisma.session.update({
      where: { id: sessionId },
      data,
    });
  }

  async findSessionById(sessionId: string) {
    return prisma.session.findFirst({
      where: { id: sessionId },
    });
  }

  async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, logoutAt: new Date(), revokedAt: new Date() },
    });
  }

  async revokeSessionsByUserId(userId: string) {
    return prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, logoutAt: new Date(), revokedAt: new Date() },
    });
  }

  async createRefreshToken(data: Parameters<typeof prisma.refreshToken.create>[0]['data']) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshTokenByJti(jti: string) {
    return prisma.refreshToken.findFirst({
      where: { jti, deletedAt: null },
    });
  }

  async findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, deletedAt: null },
    });
  }

  async revokeRefreshToken(refreshTokenId: string, replacedById?: string) {
    return prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: {
        revokedAt: new Date(),
        deletedAt: new Date(),
        ...(replacedById ? { replacedById } : {}),
      },
    });
  }

  async revokeRefreshTokensByUserId(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, deletedAt: null },
      data: {
        revokedAt: new Date(),
        deletedAt: new Date(),
      },
    });
  }

  async createPasswordResetToken(data: Parameters<typeof prisma.passwordResetToken.create>[0]['data']) {
    return prisma.passwordResetToken.create({ data });
  }

  async findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, deletedAt: null },
    });
  }

  async usePasswordResetToken(tokenId: string) {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date(), deletedAt: new Date() },
    });
  }
}
