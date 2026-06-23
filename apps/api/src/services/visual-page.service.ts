import { Prisma } from '@prisma/client';
import { VisualPageRepository, type VisualPageRecord } from '../repositories/visual-page.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { VisualPageDTO } from '../validators/visual-pages.validator.js';

const visualPageRepository = new VisualPageRepository();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const toPageStatus = (value: unknown, fallback: 'draft' | 'published' = 'draft') => {
  const raw = toStringValue(value, fallback).toLowerCase();
  if (raw === 'draft' || raw === 'published') {
    return raw;
  }
  return fallback;
};

const cloneSections = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return JSON.parse(JSON.stringify(value));
};

const normalizeVisualPage = (record: NonNullable<VisualPageRecord>) => {
  const sections = Array.isArray(record.sections) ? record.sections : [];
  return {
    id: record.id,
    slug: record.slug,
    titleAr: record.titleAr,
    titleEn: record.titleEn,
    status: toPageStatus(record.status, 'draft'),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    sections,
  };
};

const buildVisualPageWriteData = (payload: VisualPageDTO, record?: VisualPageRecord) => {
  const sections = cloneSections(payload.sections ?? record?.sections ?? []);

  return {
    data: {
      ...(payload.id ? { id: toStringValue(payload.id) } : {}),
      slug: toStringValue(payload.slug, record?.slug || 'page'),
      titleAr: toStringValue(payload.titleAr, record?.titleAr || ''),
      titleEn: toStringValue(payload.titleEn, record?.titleEn || ''),
      status: toPageStatus(payload.status, (record?.status as 'draft' | 'published') || 'draft'),
      sections: sections as Prisma.InputJsonValue,
    },
    sections,
  };
};

const ensureUniqueSlug = async (slugBase: string, excludeId?: string) => {
  let slug = slugBase;
  let suffix = 2;
  while (true) {
    const existing = await visualPageRepository.findVisualPageBySlug(slug);
    if (!existing || existing.id === excludeId) {
      return slug;
    }
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }
};

export class VisualPageService {
  async listPages(query: { search?: string; status?: string; page?: number; limit?: number }) {
    const records = await visualPageRepository.listVisualPages();
    let items = records.map((record) => normalizeVisualPage(record as NonNullable<VisualPageRecord>));

    if (query.search) {
      const search = query.search.trim().toLowerCase();
      items = items.filter((page) => {
        const haystack = [page.id, page.slug, page.titleAr, page.titleEn, JSON.stringify(page.sections)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    if (query.status) {
      items = items.filter((page) => page.status === query.status);
    }

    const page = query.page || 1;
    const limit = query.limit || items.length || 50;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return {
      items: paged,
      total: items.length,
      page,
      limit,
    };
  }

  async getPageById(id: string) {
    const record = await visualPageRepository.findVisualPageById(id);
    if (!record) {
      throw new HttpError(404, 'Visual page not found');
    }
    return normalizeVisualPage(record as NonNullable<VisualPageRecord>);
  }

  async createPage(payload: VisualPageDTO, actorId?: string | null) {
    console.log('Persisting visual page', payload);
    const normalized = buildVisualPageWriteData(payload);
    const slug = await ensureUniqueSlug(normalized.data.slug);
    console.log('Prisma operation', { action: 'visualPage.create', slug });
    const record = await visualPageRepository.createVisualPage({
      ...normalized.data,
      slug,
      createdById: actorId || null,
      updatedById: actorId || null,
    });

    await visualPageRepository.createVersion({
      visualPageId: record.id,
      versionName: `Initial version ${new Date().toISOString()}`,
      data: normalizeVisualPage(record as NonNullable<VisualPageRecord>) as Prisma.InputJsonValue,
    });

    return normalizeVisualPage(record as NonNullable<VisualPageRecord>);
  }

  async updatePage(id: string, payload: VisualPageDTO, actorId?: string | null) {
    console.log('Persisting visual page', { id, payload });
    const current = await visualPageRepository.findVisualPageById(id);
    if (!current) {
      throw new HttpError(404, 'Visual page not found');
    }

    await visualPageRepository.createVersion({
      visualPageId: current.id,
      versionName: `Snapshot ${new Date().toISOString()}`,
      data: normalizeVisualPage(current as NonNullable<VisualPageRecord>) as Prisma.InputJsonValue,
    });

    const normalized = buildVisualPageWriteData(payload, current);
    const slug = await ensureUniqueSlug(normalized.data.slug, current.id);
    console.log('Prisma operation', { action: 'visualPage.update', id, slug });
    const record = await visualPageRepository.updateVisualPage(id, {
      ...normalized.data,
      slug,
      updatedById: actorId || null,
    });
    return normalizeVisualPage(record as NonNullable<VisualPageRecord>);
  }

  async deletePage(id: string, actorId?: string | null) {
    const current = await visualPageRepository.findVisualPageById(id);
    if (!current) {
      throw new HttpError(404, 'Visual page not found');
    }

    await visualPageRepository.deleteVersions(id);
    const deleted = await visualPageRepository.softDeleteVisualPage(id, actorId || null);
    return normalizeVisualPage(deleted as NonNullable<VisualPageRecord>);
  }

  async getVersions(pageId: string) {
    const versions = await visualPageRepository.listVersions(pageId);
    return versions.map((version) => ({
      id: version.id,
      pageId: version.visualPageId,
      versionName: version.versionName,
      createdAt: version.createdAt.toISOString(),
      data: version.data as VisualPageDTO,
    }));
  }

  async restoreVersion(pageId: string, versionId: string, actorId?: string | null) {
    const version = await visualPageRepository.findVersionById(versionId);
    if (!version || version.visualPageId !== pageId) {
      throw new HttpError(404, 'Version not found');
    }

    const current = await visualPageRepository.findVisualPageById(pageId);
    if (!current) {
      throw new HttpError(404, 'Visual page not found');
    }

    await visualPageRepository.createVersion({
      visualPageId: current.id,
      versionName: `Pre-restore snapshot ${new Date().toISOString()}`,
      data: normalizeVisualPage(current as NonNullable<VisualPageRecord>) as Prisma.InputJsonValue,
    });

    const versionData = version.data as Record<string, unknown>;
    const payload: VisualPageDTO = {
      id: toStringValue(versionData.id, current.id),
      slug: toStringValue(versionData.slug, current.slug),
      titleAr: toStringValue(versionData.titleAr, current.titleAr),
      titleEn: toStringValue(versionData.titleEn, current.titleEn),
      status: toPageStatus(versionData.status, 'draft'),
      sections: Array.isArray(versionData.sections) ? versionData.sections : [],
    };
    const normalized = buildVisualPageWriteData(payload, current);
    const record = await visualPageRepository.updateVisualPage(pageId, {
      ...normalized.data,
      updatedById: actorId || null,
    });

    return normalizeVisualPage(record as NonNullable<VisualPageRecord>);
  }
}
