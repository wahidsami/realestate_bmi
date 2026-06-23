import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import { ProjectRepository, type ProjectRecord } from '../repositories/project.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { ProjectCreateDTO, ProjectUpdateDTO } from '../validators/project.validator.js';

const projectRepository = new ProjectRepository();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const toBooleanValue = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const toNumberValue = (value: unknown, fallback?: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const generateSlugBase = (payload: Record<string, unknown>) => {
  const name = payload.name;
  if (isRecord(name)) {
    const candidate = toStringValue(name.ar || name.en);
    if (candidate) return slugify(candidate);
  }

  const nameAr = toStringValue(payload.nameAr);
  const nameEn = toStringValue(payload.nameEn);
  if (nameAr) return slugify(nameAr);
  if (nameEn) return slugify(nameEn);

  return `project-${crypto.randomUUID().slice(0, 8)}`;
};

const buildProjectWriteData = (payload: ProjectCreateDTO | ProjectUpdateDTO, record?: ProjectRecord) => {
  const currentMetadata = parseJsonObject(record?.metadata ?? null);
  const currentName = {
    ar: record?.nameAr || '',
    en: record?.nameEn || '',
  };
  const currentDescription = {
    ar: record?.descriptionAr || '',
    en: record?.descriptionEn || '',
  };
  const currentCity = {
    ar: record?.cityAr || '',
    en: record?.cityEn || '',
  };
  const currentDistrict = {
    ar: record?.districtAr || '',
    en: record?.districtEn || '',
  };
  const currentAddress = {
    ar: record?.addressAr || '',
    en: record?.addressEn || '',
  };

  const name = toBilingualText(payload.name, currentName);
  const description = toBilingualText(payload.description, currentDescription);
  const city = toBilingualText(payload.city, currentCity);
  const district = toBilingualText(payload.district, currentDistrict);
  const address = toBilingualText(payload.address, currentAddress);
  const location = toBilingualText(payload.location, toBilingualText(currentMetadata.location, currentAddress));

  const metadata: Record<string, unknown> = { ...currentMetadata };
  setDefinedValue(metadata, 'location', payload.location ? location : currentMetadata.location);
  setDefinedValue(metadata, 'googleMapsLink', payload.googleMapsLink ?? currentMetadata.googleMapsLink);
  setDefinedValue(metadata, 'latitude', payload.latitude ?? currentMetadata.latitude);
  setDefinedValue(metadata, 'longitude', payload.longitude ?? currentMetadata.longitude);
  setDefinedValue(metadata, 'coverImageId', payload.coverImageId ?? currentMetadata.coverImageId);
  setDefinedValue(metadata, 'galleryImageIds', payload.galleryImageIds ?? currentMetadata.galleryImageIds);
  setDefinedValue(metadata, 'brochurePdfId', payload.brochurePdfId ?? currentMetadata.brochurePdfId);
  setDefinedValue(metadata, 'videoUploadId', payload.videoUploadId ?? currentMetadata.videoUploadId);
  setDefinedValue(metadata, 'amenityParking', payload.amenityParking ?? currentMetadata.amenityParking);
  setDefinedValue(metadata, 'amenitySecurity', payload.amenitySecurity ?? currentMetadata.amenitySecurity);
  setDefinedValue(metadata, 'amenityElevators', payload.amenityElevators ?? currentMetadata.amenityElevators);
  setDefinedValue(metadata, 'amenityMosque', payload.amenityMosque ?? currentMetadata.amenityMosque);
  setDefinedValue(metadata, 'amenityGym', payload.amenityGym ?? currentMetadata.amenityGym);
  setDefinedValue(metadata, 'amenityPool', payload.amenityPool ?? currentMetadata.amenityPool);
  setDefinedValue(metadata, 'amenityChildrenArea', payload.amenityChildrenArea ?? currentMetadata.amenityChildrenArea);
  setDefinedValue(metadata, 'customAmenities', payload.customAmenities ?? currentMetadata.customAmenities);
  setDefinedValue(metadata, 'slug', payload.slug ?? record?.slug ?? toStringValue(currentMetadata.slug, ''));

  return {
    data: {
      ...(payload.id ? { id: toStringValue(payload.id) } : {}),
      slug: toStringValue(payload.slug, record?.slug || generateSlugBase(payload as Record<string, unknown>)),
      nameAr: name.ar,
      nameEn: name.en,
      descriptionAr: description.ar || null,
      descriptionEn: description.en || null,
      cityAr: city.ar || null,
      cityEn: city.en || null,
      districtAr: district.ar || null,
      districtEn: district.en || null,
      addressAr: address.ar || null,
      addressEn: address.en || null,
      completionDate: payload.completionDate ? new Date(payload.completionDate) : record?.completionDate || null,
      status: toStringValue(payload.status, record?.status || 'draft'),
      featured: toBooleanValue(payload.featured, record?.featured || false),
      coverMediaId: toStringValue(payload.coverImageId, record?.coverMediaId || ''),
      seoTitleAr: toStringValue(payload.seoTitleAr, record?.seoTitleAr || '') || null,
      seoTitleEn: toStringValue(payload.seoTitleEn, record?.seoTitleEn || '') || null,
      seoDescriptionAr: toStringValue(payload.seoDescAr, record?.seoDescriptionAr || '') || null,
      seoDescriptionEn: toStringValue(payload.seoDescEn, record?.seoDescriptionEn || '') || null,
      seoKeywords: toStringValue((payload as Record<string, unknown>).seoKeywords, record?.seoKeywords || '') || null,
      metadata: metadata as Prisma.InputJsonValue,
    },
    metadata,
  };
};

const mapRecordToProject = (record: NonNullable<ProjectRecord>) => {
  const metadata = parseJsonObject(record.metadata);
  const location = toBilingualText(metadata.location || { ar: record.addressAr || '', en: record.addressEn || '' });

  return {
    id: record.id,
    name: {
      ar: record.nameAr,
      en: record.nameEn,
    },
    description: {
      ar: record.descriptionAr || '',
      en: record.descriptionEn || '',
    },
    location,
    city: {
      ar: record.cityAr || '',
      en: record.cityEn || '',
    },
    district: {
      ar: record.districtAr || '',
      en: record.districtEn || '',
    },
    address: {
      ar: record.addressAr || '',
      en: record.addressEn || '',
    },
    completionDate: record.completionDate ? record.completionDate.toISOString().slice(0, 10) : '',
    status: toStringValue(record.status, 'draft') as 'available' | 'under-construction' | 'sold-out',
    googleMapsLink: toStringValue(metadata.googleMapsLink, ''),
    latitude: metadata.latitude !== undefined ? toNumberValue(metadata.latitude) : undefined,
    longitude: metadata.longitude !== undefined ? toNumberValue(metadata.longitude) : undefined,
    featured: Boolean(record.featured),
    coverImageId: record.coverMediaId || toStringValue(metadata.coverImageId, ''),
    galleryImageIds: Array.isArray(metadata.galleryImageIds) ? (metadata.galleryImageIds as string[]) : [],
    brochurePdfId: toStringValue(metadata.brochurePdfId, ''),
    videoUploadId: toStringValue(metadata.videoUploadId, ''),
    amenityParking: Boolean(metadata.amenityParking),
    amenitySecurity: Boolean(metadata.amenitySecurity),
    amenityElevators: Boolean(metadata.amenityElevators),
    amenityMosque: Boolean(metadata.amenityMosque),
    amenityGym: Boolean(metadata.amenityGym),
    amenityPool: Boolean(metadata.amenityPool),
    amenityChildrenArea: Boolean(metadata.amenityChildrenArea),
    customAmenities: Array.isArray(metadata.customAmenities) ? (metadata.customAmenities as Array<{ ar: string; en: string }>) : [],
    seoTitleAr: record.seoTitleAr || '',
    seoTitleEn: record.seoTitleEn || '',
    seoDescAr: record.seoDescriptionAr || '',
    seoDescEn: record.seoDescriptionEn || '',
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};

export class ProjectService {
  async listProjects(query: { search?: string; status?: string; featured?: boolean; page?: number; limit?: number }) {
    const records = await projectRepository.listProjects();
    let items = records.map((record) => mapRecordToProject(record as NonNullable<ProjectRecord>));

    if (query.search) {
      const search = query.search.trim().toLowerCase();
      items = items.filter((project) => {
        const haystack = [
          project.id,
          project.name?.ar,
          project.name?.en,
          project.description?.ar,
          project.description?.en,
          project.city?.ar,
          project.city?.en,
          project.district?.ar,
          project.district?.en,
          project.address?.ar,
          project.address?.en,
          project.seoTitleAr,
          project.seoTitleEn,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    if (query.status) {
      items = items.filter((project) => project.status === query.status);
    }

    if (typeof query.featured === 'boolean') {
      items = items.filter((project) => Boolean(project.featured) === query.featured);
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

  async getProjectById(id: string) {
    const record = await projectRepository.findProjectById(id);
    if (!record) {
      throw new HttpError(404, 'Project not found');
    }
    return mapRecordToProject(record as NonNullable<ProjectRecord>);
  }

  async createProject(payload: ProjectCreateDTO, actorId?: string | null) {
    const normalized = buildProjectWriteData(payload);
    const data = normalized.data;
    const slugBase = data.slug;
    let slug = slugBase;
    let suffix = 2;
    while (await projectRepository.findProjectBySlug(slug)) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const record = await projectRepository.createProject({
      ...data,
      slug,
      createdById: actorId || null,
      updatedById: actorId || null,
    });

    return mapRecordToProject(record as NonNullable<ProjectRecord>);
  }

  async updateProject(id: string, payload: ProjectUpdateDTO, actorId?: string | null) {
    const current = await projectRepository.findProjectById(id);
    if (!current) {
      throw new HttpError(404, 'Project not found');
    }

    const normalized = buildProjectWriteData(payload, current);
    const record = await projectRepository.updateProject(id, {
      ...normalized.data,
      updatedById: actorId || null,
    });

    return mapRecordToProject(record as NonNullable<ProjectRecord>);
  }

  async deleteProject(id: string, actorId?: string | null) {
    const current = await projectRepository.findProjectById(id);
    if (!current) {
      throw new HttpError(404, 'Project not found');
    }

    const deleted = await projectRepository.softDeleteProject(id, actorId || null);
    return mapRecordToProject(deleted as NonNullable<ProjectRecord>);
  }
}
