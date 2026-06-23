import { Prisma } from '@prisma/client';
import { BuilderAssetRepository, type BuilderAssetRecord } from '../repositories/builder-asset.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { BuilderAssetDTO, BuilderAssetUpdateDTO } from '../validators/builder-asset.validator.js';

const builderAssetRepository = new BuilderAssetRepository();

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeAsset = (record: NonNullable<BuilderAssetRecord>) => ({
  id: record.id,
  kind: record.kind,
  key: record.key || undefined,
  nameAr: record.nameAr,
  nameEn: record.nameEn,
  data: record.data,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

const buildWriteData = (payload: BuilderAssetDTO | BuilderAssetUpdateDTO, record?: BuilderAssetRecord) => {
  const currentData = isRecord(record?.data) ? record?.data : {};
  return {
    data: {
      kind: payload.kind || record?.kind || 'reusable_component',
      key: payload.key ?? record?.key ?? null,
      nameAr: payload.nameAr ?? record?.nameAr ?? '',
      nameEn: payload.nameEn ?? record?.nameEn ?? '',
      data: (payload.data !== undefined ? payload.data : currentData) as Prisma.InputJsonValue,
    },
  };
};

export class BuilderAssetService {
  async listAssets(query: { kind?: string }) {
    const items = await builderAssetRepository.listAssets(query.kind);
    return items.map((record) => normalizeAsset(record as NonNullable<BuilderAssetRecord>));
  }

  async createAsset(payload: BuilderAssetDTO, actorId?: string | null) {
    const normalized = buildWriteData(payload);
    const created = await builderAssetRepository.createAsset({
      ...normalized.data,
      createdById: actorId || null,
      updatedById: actorId || null,
    });
    return normalizeAsset(created as NonNullable<BuilderAssetRecord>);
  }

  async updateAsset(id: string, payload: BuilderAssetUpdateDTO, actorId?: string | null) {
    const current = await builderAssetRepository.findAssetById(id);
    if (!current) {
      throw new HttpError(404, 'Builder asset not found');
    }

    const normalized = buildWriteData(payload, current);
    const updated = await builderAssetRepository.updateAsset(id, {
      ...normalized.data,
      updatedById: actorId || null,
    });
    return normalizeAsset(updated as NonNullable<BuilderAssetRecord>);
  }

  async deleteAsset(id: string, actorId?: string | null) {
    const current = await builderAssetRepository.findAssetById(id);
    if (!current) {
      throw new HttpError(404, 'Builder asset not found');
    }
    const deleted = await builderAssetRepository.softDeleteAsset(id, actorId || null);
    return normalizeAsset(deleted as NonNullable<BuilderAssetRecord>);
  }
}
