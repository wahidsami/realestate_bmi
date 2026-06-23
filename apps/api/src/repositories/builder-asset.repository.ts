import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type BuilderAssetRecord = {
  id: string;
  kind: string;
  key: string | null;
  nameAr: string;
  nameEn: string;
  data: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
};

export class BuilderAssetRepository {
  async listAssets(kind?: string) {
    return prisma.builderAsset.findMany({
      where: {
        deletedAt: null,
        ...(kind ? { kind } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
    }) as unknown as Promise<BuilderAssetRecord[]>;
  }

  async findAssetById(id: string) {
    return prisma.builderAsset.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Promise<BuilderAssetRecord | null>;
  }

  async createAsset(data: Prisma.BuilderAssetUncheckedCreateInput) {
    return prisma.builderAsset.create({ data }) as unknown as Promise<BuilderAssetRecord>;
  }

  async updateAsset(id: string, data: Prisma.BuilderAssetUncheckedUpdateInput) {
    return prisma.builderAsset.update({
      where: { id },
      data,
    }) as unknown as Promise<BuilderAssetRecord>;
  }

  async softDeleteAsset(id: string, updatedById?: string | null) {
    return prisma.builderAsset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: updatedById || undefined,
      },
    }) as unknown as Promise<BuilderAssetRecord>;
  }
}
