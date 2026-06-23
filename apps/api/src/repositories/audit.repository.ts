import { prisma } from '../config/prisma.js';

export class AuditRepository {
  async log(input: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    description?: string;
    oldValues?: unknown;
    newValues?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        description: input.description,
        oldValues: input.oldValues as never,
        newValues: input.newValues as never,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }
}
