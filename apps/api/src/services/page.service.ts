import { Prisma } from '@prisma/client';
import { PageRepository, type PageRecord } from '../repositories/page.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { PageCreateDTO, PageUpdateDTO } from '../validators/page.validator.js';

const pageRepository = new PageRepository();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const toNullableString = (value: unknown) => {
  const text = toStringValue(value, '').trim();
  return text ? text : null;
};

const toNumberValue = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toPageStatus = (value: unknown, fallback: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT') => {
  const raw = toStringValue(value, fallback).toUpperCase();
  if (raw === 'PUBLISHED' || raw === 'ARCHIVED' || raw === 'DRAFT') {
    return raw;
  }
  return fallback;
};

const toBilingualText = (value: unknown, fallback = { ar: '', en: '' }) => {
  if (isRecord(value)) {
    return {
      ar: toStringValue(value.ar, fallback.ar),
      en: toStringValue(value.en, fallback.en),
    };
  }

  return fallback;
};

const parseJsonObject = (value: Prisma.JsonValue | null | undefined): Record<string, unknown> => {
  if (isRecord(value)) {
    return value;
  }
  return {};
};

const setDefinedValue = (target: Record<string, unknown>, key: string, value: unknown) => {
  if (value !== undefined) {
    target[key] = value;
  }
};

const buildPageWriteData = (payload: PageCreateDTO | PageUpdateDTO, record?: PageRecord) => {
  const currentMetadata = parseJsonObject(record?.metadata ?? null);
  const title = toBilingualText(payload.title, {
    ar: record?.titleAr || '',
    en: record?.titleEn || '',
  });
  const subtitle = toBilingualText(payload.subtitle, {
    ar: record?.subtitleAr || '',
    en: record?.subtitleEn || '',
  });

  const metadata: Record<string, unknown> = { ...currentMetadata };
  setDefinedValue(metadata, 'sections', payload.sections ?? currentMetadata.sections);
  setDefinedValue(metadata, 'slugAr', payload.slugAr ?? currentMetadata.slugAr);
  setDefinedValue(metadata, 'slugEn', payload.slugEn ?? currentMetadata.slugEn);

  return {
    data: {
      ...(payload.id ? { id: toStringValue(payload.id) } : {}),
      slug: toStringValue(payload.slug, record?.slug || payload.slugAr || payload.slugEn || 'page'),
      titleAr: title.ar,
      titleEn: title.en,
      subtitleAr: subtitle.ar || null,
      subtitleEn: subtitle.en || null,
      contentAr: toNullableString(payload.contentAr) ?? record?.contentAr ?? null,
      contentEn: toNullableString(payload.contentEn) ?? record?.contentEn ?? null,
      seoTitleAr: toNullableString(payload.seoTitleAr) ?? record?.seoTitleAr ?? null,
      seoTitleEn: toNullableString(payload.seoTitleEn) ?? record?.seoTitleEn ?? null,
      seoDescriptionAr: toNullableString(payload.seoDescAr) ?? record?.seoDescriptionAr ?? null,
      seoDescriptionEn: toNullableString(payload.seoDescEn) ?? record?.seoDescriptionEn ?? null,
      status: toPageStatus(payload.status, (record?.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') || 'DRAFT'),
      parentId: payload.parentId === undefined ? record?.parentId ?? null : payload.parentId,
      sortOrder: payload.sortOrder !== undefined ? toNumberValue(payload.sortOrder) : record?.sortOrder ?? 0,
      publishedAt: payload.status === 'published' ? new Date() : record?.publishedAt ?? null,
      metadata: metadata as Prisma.InputJsonValue,
    },
    metadata,
  };
};

const mapRecordToPage = (record: NonNullable<PageRecord>) => {
  const metadata = parseJsonObject(record.metadata);
  const sections = Array.isArray(metadata.sections) ? metadata.sections : [];

  return {
    id: record.id,
    slug: record.slug,
    title: {
      ar: record.titleAr,
      en: record.titleEn,
    },
    subtitle: record.subtitleAr || record.subtitleEn ? {
      ar: record.subtitleAr || '',
      en: record.subtitleEn || '',
    } : undefined,
    sections: sections as Array<{
      id: string;
      title?: { ar: string; en: string };
      body: { ar: string; en: string };
    }>,
    slugAr: toStringValue(metadata.slugAr, ''),
    slugEn: toStringValue(metadata.slugEn, record.slug),
    contentAr: record.contentAr || '',
    contentEn: record.contentEn || '',
    seoTitleAr: record.seoTitleAr || '',
    seoTitleEn: record.seoTitleEn || '',
    seoDescAr: record.seoDescriptionAr || '',
    seoDescEn: record.seoDescriptionEn || '',
    status: toStringValue(record.status, 'draft').toLowerCase() as 'draft' | 'published' | 'archived',
    parentId: record.parentId || undefined,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};

export class PageService {
  async listPages(query: { search?: string; status?: string; parentId?: string; page?: number; limit?: number }) {
    const records = await pageRepository.listPages();
    let items = records.map((record) => mapRecordToPage(record as NonNullable<PageRecord>));

    if (query.search) {
      const search = query.search.trim().toLowerCase();
      items = items.filter((page) => {
        const haystack = [
          page.id,
          page.slug,
          page.title?.ar,
          page.title?.en,
          page.subtitle?.ar,
          page.subtitle?.en,
          page.contentAr,
          page.contentEn,
          page.seoTitleAr,
          page.seoTitleEn,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    if (query.status) {
      items = items.filter((page) => page.status === query.status);
    }

    if (query.parentId) {
      items = items.filter((page) => page.parentId === query.parentId);
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
    const record = await pageRepository.findPageById(id);
    if (!record) {
      throw new HttpError(404, 'Page not found');
    }
    return mapRecordToPage(record as NonNullable<PageRecord>);
  }

  async createPage(payload: PageCreateDTO, actorId?: string | null) {
    console.log('Persisting page', payload);
    const normalized = buildPageWriteData(payload);
    console.log('Prisma operation', { action: 'page.create', slug: normalized.data.slug });
    const record = await pageRepository.createPage({
      ...normalized.data,
      createdById: actorId || null,
      updatedById: actorId || null,
    });
    return mapRecordToPage(record as NonNullable<PageRecord>);
  }

  async updatePage(id: string, payload: PageUpdateDTO, actorId?: string | null) {
    console.log('Persisting page', { id, payload });
    const current = await pageRepository.findPageById(id);
    if (!current) {
      throw new HttpError(404, 'Page not found');
    }

    const normalized = buildPageWriteData(payload, current);
    console.log('Prisma operation', { action: 'page.update', id, slug: normalized.data.slug });
    const record = await pageRepository.updatePage(id, {
      ...normalized.data,
      updatedById: actorId || null,
    });
    return mapRecordToPage(record as NonNullable<PageRecord>);
  }

  async deletePage(id: string, actorId?: string | null) {
    const current = await pageRepository.findPageById(id);
    if (!current) {
      throw new HttpError(404, 'Page not found');
    }

    const deleted = await pageRepository.softDeletePage(id, actorId || null);
    return mapRecordToPage(deleted as NonNullable<PageRecord>);
  }
}
