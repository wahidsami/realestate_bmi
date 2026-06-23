import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type WebsiteSettingsRecord = {
  id: string;
  key: string;
  value: unknown;
  group: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class SettingsRepository {
  public async getCurrentSettings() {
    return prisma.setting.findFirst({
      where: {
        key: 'current_settings',
        deletedAt: null,
      },
    });
  }

  public async upsertCurrentSettings(value: Prisma.InputJsonValue) {
    return prisma.setting.upsert({
      where: { key: 'current_settings' },
      update: {
        value,
        group: 'website',
      },
      create: {
        key: 'current_settings',
        value,
        group: 'website',
        descriptionAr: 'إعدادات الموقع العامة',
        descriptionEn: 'Website settings',
      },
    });
  }
}
