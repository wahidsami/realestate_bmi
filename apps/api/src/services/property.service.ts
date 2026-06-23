import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import { AuditRepository } from '../repositories/audit.repository.js';
import { PropertyRepository, type PropertyRecord } from '../repositories/property.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { PropertyCreateDTO, PropertyUpdateDTO } from '../validators/property.validator.js';

const propertyRepository = new PropertyRepository();
const projectRepository = new ProjectRepository();
const auditRepository = new AuditRepository();

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
  return text ? text : undefined;
};

const toNumberValue = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toBooleanValue = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const toArrayValue = <T>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
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

const toDateString = (value: Date | string | null | undefined) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
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

const resolveNullableForeignKey = async (value: unknown) => {
  const candidate = toNullableString(value);
  if (!candidate) {
    return null;
  }

  const exists = await projectRepository.findProjectById(candidate);
  return exists ? candidate : null;
};

const resolveProjectIdForWrite = async (payloadProjectId: unknown, currentProjectId?: string | null) => {
  if (payloadProjectId !== undefined) {
    return resolveNullableForeignKey(payloadProjectId);
  }

  if (!currentProjectId) {
    return null;
  }

  const exists = await projectRepository.findProjectById(currentProjectId);
  return exists ? currentProjectId : null;
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
  const title = payload.title;
  if (isRecord(title)) {
    const candidate = toStringValue(title.ar || title.en);
    if (candidate) return slugify(candidate);
  }
  const titleAr = toStringValue(payload.titleAr);
  const titleEn = toStringValue(payload.titleEn);
  if (titleAr) return slugify(titleAr);
  if (titleEn) return slugify(titleEn);
  return `property-${crypto.randomUUID().slice(0, 8)}`;
};

const normalizeBilingualObject = (value: unknown, fallback?: { ar: string; en: string }) => {
  if (isRecord(value)) {
    return {
      ar: toStringValue(value.ar, fallback?.ar || ''),
      en: toStringValue(value.en, fallback?.en || ''),
    };
  }

  return fallback;
};

const buildPropertyWriteData = async (payload: PropertyCreateDTO | PropertyUpdateDTO, record?: PropertyRecord) => {
  const currentMetadata = parseJsonObject(record?.metadata ?? null);
  const currentTitle = {
    ar: record?.titleAr || '',
    en: record?.titleEn || '',
  };
  const currentDescription = {
    ar: record?.descriptionAr || '',
    en: record?.descriptionEn || '',
  };
  const title = normalizeBilingualObject(payload.title, currentTitle) || currentTitle;
  const description = normalizeBilingualObject(payload.description, currentDescription) || currentDescription;
  const location = normalizeBilingualObject(payload.location, normalizeBilingualObject(currentMetadata.location, { ar: '', en: '' }));
  const district = normalizeBilingualObject(payload.district, normalizeBilingualObject(currentMetadata.district, undefined));
  const address = normalizeBilingualObject(payload.address, normalizeBilingualObject(currentMetadata.address, undefined));
  const type = normalizeBilingualObject(payload.type, normalizeBilingualObject(currentMetadata.type, undefined));
  const finishingType = normalizeBilingualObject(payload.finishingType, normalizeBilingualObject(currentMetadata.finishingType, undefined));
  const ownershipType = normalizeBilingualObject(payload.ownershipType, normalizeBilingualObject(currentMetadata.ownershipType, undefined));
  const developer = normalizeBilingualObject(payload.developer, normalizeBilingualObject(currentMetadata.developer, undefined));
  const projectId = await resolveProjectIdForWrite(payload.projectId, record?.projectId ?? null);
  const featuredMediaId = toNullableString(payload.featuredImageId) ?? record?.featuredMediaId ?? null;

  const metadata: Record<string, unknown> = { ...currentMetadata };
  setDefinedValue(metadata, 'title', payload.title ? title : currentMetadata.title);
  setDefinedValue(metadata, 'description', payload.description ? description : currentMetadata.description);
  setDefinedValue(metadata, 'location', payload.location ? location : currentMetadata.location);
  setDefinedValue(metadata, 'district', payload.district ? district : currentMetadata.district);
  setDefinedValue(metadata, 'address', payload.address ? address : currentMetadata.address);
  setDefinedValue(metadata, 'coordinates', payload.coordinates ?? currentMetadata.coordinates);
  setDefinedValue(metadata, 'type', payload.type ? type : currentMetadata.type);
  setDefinedValue(metadata, 'bedrooms', payload.bedrooms ?? currentMetadata.bedrooms);
  setDefinedValue(metadata, 'bathrooms', payload.bathrooms ?? currentMetadata.bathrooms);
  setDefinedValue(metadata, 'areaSqm', payload.areaSqm ?? currentMetadata.areaSqm);
  setDefinedValue(metadata, 'livingRooms', payload.livingRooms ?? currentMetadata.livingRooms);
  setDefinedValue(metadata, 'balconies', payload.balconies ?? currentMetadata.balconies);
  setDefinedValue(metadata, 'parkingSpaces', payload.parkingSpaces ?? currentMetadata.parkingSpaces);
  setDefinedValue(metadata, 'floorNumber', payload.floorNumber ?? currentMetadata.floorNumber);
  setDefinedValue(metadata, 'propertyAge', payload.propertyAge ?? currentMetadata.propertyAge);
  setDefinedValue(metadata, 'unitNumber', payload.unitNumber ?? currentMetadata.unitNumber);
  setDefinedValue(metadata, 'unitCode', payload.unitCode ?? currentMetadata.unitCode);
  setDefinedValue(metadata, 'finishingType', payload.finishingType ? finishingType : currentMetadata.finishingType);
  setDefinedValue(metadata, 'ownershipType', payload.ownershipType ? ownershipType : currentMetadata.ownershipType);
  setDefinedValue(metadata, 'developer', payload.developer ? developer : currentMetadata.developer);
  setDefinedValue(metadata, 'projectId', projectId ?? currentMetadata.projectId);
  setDefinedValue(metadata, 'status', payload.status ?? currentMetadata.status);
  setDefinedValue(metadata, 'googleMapsLink', payload.googleMapsLink ?? currentMetadata.googleMapsLink);
  setDefinedValue(metadata, 'saleOrRent', payload.saleOrRent ?? currentMetadata.saleOrRent);
  setDefinedValue(metadata, 'featured', payload.featured ?? currentMetadata.featured);
  setDefinedValue(metadata, 'galleryImageIds', payload.galleryImageIds ?? currentMetadata.galleryImageIds);
  setDefinedValue(metadata, 'floorPlanMediaIds', payload.floorPlanMediaIds ?? currentMetadata.floorPlanMediaIds);
  setDefinedValue(metadata, 'floorPlanImageId', payload.floorPlanImageId ?? currentMetadata.floorPlanImageId);
  setDefinedValue(metadata, 'documentMediaIds', payload.documentMediaIds ?? currentMetadata.documentMediaIds);
  setDefinedValue(metadata, 'videoUploadId', payload.videoUploadId ?? currentMetadata.videoUploadId);
  setDefinedValue(metadata, 'amenityParking', payload.amenityParking ?? currentMetadata.amenityParking);
  setDefinedValue(metadata, 'amenityCoveredParking', payload.amenityCoveredParking ?? currentMetadata.amenityCoveredParking);
  setDefinedValue(metadata, 'amenityPool', payload.amenityPool ?? currentMetadata.amenityPool);
  setDefinedValue(metadata, 'amenityPrivatePool', payload.amenityPrivatePool ?? currentMetadata.amenityPrivatePool);
  setDefinedValue(metadata, 'amenityGym', payload.amenityGym ?? currentMetadata.amenityGym);
  setDefinedValue(metadata, 'amenityElevator', payload.amenityElevator ?? currentMetadata.amenityElevator);
  setDefinedValue(metadata, 'amenitySecurity', payload.amenitySecurity ?? currentMetadata.amenitySecurity);
  setDefinedValue(metadata, 'amenityMosque', payload.amenityMosque ?? currentMetadata.amenityMosque);
  setDefinedValue(metadata, 'amenityChildrenArea', payload.amenityChildrenArea ?? currentMetadata.amenityChildrenArea);
  setDefinedValue(metadata, 'amenityGarden', payload.amenityGarden ?? currentMetadata.amenityGarden);
  setDefinedValue(metadata, 'amenityMaidRoom', payload.amenityMaidRoom ?? currentMetadata.amenityMaidRoom);
  setDefinedValue(metadata, 'amenityDriverRoom', payload.amenityDriverRoom ?? currentMetadata.amenityDriverRoom);
  setDefinedValue(metadata, 'amenitySmartHome', payload.amenitySmartHome ?? currentMetadata.amenitySmartHome);
  setDefinedValue(metadata, 'customAmenities', payload.customAmenities ?? currentMetadata.customAmenities);
  setDefinedValue(metadata, 'highlights', payload.highlights ?? currentMetadata.highlights);
  setDefinedValue(metadata, 'projectVideoUrl', payload.projectVideoUrl ?? currentMetadata.projectVideoUrl);
  setDefinedValue(metadata, 'virtualTourUrl', payload.virtualTourUrl ?? currentMetadata.virtualTourUrl);
  setDefinedValue(metadata, 'tour360Url', payload.tour360Url ?? currentMetadata.tour360Url);
  setDefinedValue(metadata, 'nearbyPlaces', payload.nearbyPlaces ?? currentMetadata.nearbyPlaces);
  setDefinedValue(metadata, 'seoKeywords', payload.seoKeywords ?? currentMetadata.seoKeywords);
  setDefinedValue(metadata, 'openGraphImageId', payload.openGraphImageId ?? currentMetadata.openGraphImageId);
  setDefinedValue(metadata, 'canonicalUrl', payload.canonicalUrl ?? currentMetadata.canonicalUrl);
  setDefinedValue(metadata, 'seoTitleAr', payload.seoTitleAr ?? currentMetadata.seoTitleAr);
  setDefinedValue(metadata, 'seoTitleEn', payload.seoTitleEn ?? currentMetadata.seoTitleEn);
  setDefinedValue(metadata, 'seoDescAr', payload.seoDescAr ?? currentMetadata.seoDescAr);
  setDefinedValue(metadata, 'seoDescEn', payload.seoDescEn ?? currentMetadata.seoDescEn);
  setDefinedValue(metadata, 'inquiryMobile', payload.inquiryMobile ?? currentMetadata.inquiryMobile);
  setDefinedValue(metadata, 'inquiryEmail', payload.inquiryEmail ?? currentMetadata.inquiryEmail);
  setDefinedValue(metadata, 'inquiryMessageDefault', payload.inquiryMessageDefault ?? currentMetadata.inquiryMessageDefault);
  setDefinedValue(metadata, 'slug', payload.slug ?? record?.slug ?? toStringValue(currentMetadata.slug, ''));

  const priceValue = payload.price ?? (record ? Number(record.price.toString()) : 0);
  const listingDateValue = payload.listingDate ? new Date(payload.listingDate) : record?.listingDate || null;

  return {
    data: {
      ...(payload.id ? { id: toStringValue(payload.id) } : {}),
      slug: toStringValue(payload.slug, record?.slug || generateSlugBase(payload as Record<string, unknown>)),
      titleAr: title.ar,
      titleEn: title.en,
      descriptionAr: description.ar || null,
      descriptionEn: description.en || null,
      price: new Prisma.Decimal(toNumberValue(priceValue, 0)),
      currency: toStringValue(payload.currency, record?.currency || 'SAR'),
      status: toStringValue(payload.status, record?.status || 'available'),
      saleOrRent: toStringValue(payload.saleOrRent, record?.saleOrRent || 'sale'),
      featured: toBooleanValue(payload.featured, record?.featured || false),
      projectId,
      categoryId: toNullableString(payload.categoryId) ?? record?.categoryId ?? null,
      featuredMediaId,
      seoTitleAr: toNullableString(payload.seoTitleAr) ?? record?.seoTitleAr ?? null,
      seoTitleEn: toNullableString(payload.seoTitleEn) ?? record?.seoTitleEn ?? null,
      seoDescriptionAr: toNullableString(payload.seoDescAr) ?? record?.seoDescriptionAr ?? null,
      seoDescriptionEn: toNullableString(payload.seoDescEn) ?? record?.seoDescriptionEn ?? null,
      seoKeywords: toNullableString(payload.seoKeywords) ?? record?.seoKeywords ?? null,
      listingDate: listingDateValue,
      publishedAt: record?.publishedAt || null,
      metadata: metadata as Prisma.InputJsonValue,
    },
    metadata,
  };
};

const mapRecordToProperty = (record: NonNullable<PropertyRecord>) => {
  const metadata = parseJsonObject(record.metadata);
  const title = toBilingualText(metadata.title || { ar: record.titleAr, en: record.titleEn });
  const description = toBilingualText(metadata.description || { ar: record.descriptionAr || '', en: record.descriptionEn || '' });
  const location = toBilingualText(metadata.location || { ar: '', en: '' });
  const district = metadata.district ? toBilingualText(metadata.district) : undefined;
  const address = metadata.address ? toBilingualText(metadata.address) : undefined;
  const type = metadata.type ? toBilingualText(metadata.type) : { ar: '', en: '' };
  const finishingType = metadata.finishingType ? toBilingualText(metadata.finishingType) : undefined;
  const ownershipType = metadata.ownershipType ? toBilingualText(metadata.ownershipType) : undefined;
  const developer = metadata.developer ? toBilingualText(metadata.developer) : undefined;

  return {
    id: record.id,
    title,
    description,
    price: toNumberValue(record.price.toString(), 0),
    status: toStringValue(metadata.status, record.status),
    type,
    location,
    district,
    address,
    coordinates: toStringValue(metadata.coordinates, ''),
    bedrooms: metadata.bedrooms !== undefined ? toNumberValue(metadata.bedrooms, 0) : 0,
    bathrooms: metadata.bathrooms !== undefined ? toNumberValue(metadata.bathrooms, 0) : 0,
    livingRooms: metadata.livingRooms !== undefined ? toNumberValue(metadata.livingRooms, 0) : undefined,
    areaSqm: metadata.areaSqm !== undefined ? toNumberValue(metadata.areaSqm, 0) : 0,
    balconies: metadata.balconies !== undefined ? toNumberValue(metadata.balconies, 0) : undefined,
    parkingSpaces: metadata.parkingSpaces !== undefined ? toNumberValue(metadata.parkingSpaces, 0) : undefined,
    floorNumber: metadata.floorNumber !== undefined ? toNumberValue(metadata.floorNumber, 0) : undefined,
    propertyAge: metadata.propertyAge !== undefined ? toNumberValue(metadata.propertyAge, 0) : undefined,
    unitNumber: toStringValue(metadata.unitNumber, ''),
    unitCode: toStringValue(metadata.unitCode, ''),
    finishingType,
    ownershipType,
    developer,
    currency: record.currency,
    googleMapsLink: toStringValue(metadata.googleMapsLink, ''),
    saleOrRent: toStringValue(metadata.saleOrRent, record.saleOrRent),
    featured: toBooleanValue(metadata.featured, record.featured),
    listingDate: toDateString(record.listingDate),
    featuredImageId: record.featuredMediaId || toStringValue(metadata.featuredImageId, ''),
    galleryImageIds: toArrayValue<string>(metadata.galleryImageIds),
    floorPlanMediaIds: toArrayValue<string>(metadata.floorPlanMediaIds),
    floorPlanImageId: toStringValue(metadata.floorPlanImageId, ''),
    documentMediaIds: toArrayValue<string>(metadata.documentMediaIds),
    videoUploadId: toStringValue(metadata.videoUploadId, ''),
    projectId: record.projectId || toStringValue(metadata.projectId, ''),
    amenityParking: toBooleanValue(metadata.amenityParking, false),
    amenityCoveredParking: toBooleanValue(metadata.amenityCoveredParking, false),
    amenityPool: toBooleanValue(metadata.amenityPool, false),
    amenityPrivatePool: toBooleanValue(metadata.amenityPrivatePool, false),
    amenityGym: toBooleanValue(metadata.amenityGym, false),
    amenityElevator: toBooleanValue(metadata.amenityElevator, false),
    amenitySecurity: toBooleanValue(metadata.amenitySecurity, false),
    amenityMosque: toBooleanValue(metadata.amenityMosque, false),
    amenityChildrenArea: toBooleanValue(metadata.amenityChildrenArea, false),
    amenityGarden: toBooleanValue(metadata.amenityGarden, false),
    amenityMaidRoom: toBooleanValue(metadata.amenityMaidRoom, false),
    amenityDriverRoom: toBooleanValue(metadata.amenityDriverRoom, false),
    amenitySmartHome: toBooleanValue(metadata.amenitySmartHome, false),
    customAmenities: toArrayValue(metadata.customAmenities),
    highlights: toArrayValue(metadata.highlights),
    projectVideoUrl: toStringValue(metadata.projectVideoUrl, ''),
    virtualTourUrl: toStringValue(metadata.virtualTourUrl, ''),
    tour360Url: toStringValue(metadata.tour360Url, ''),
    nearbyPlaces: toArrayValue(metadata.nearbyPlaces),
    seoKeywords: toStringValue(metadata.seoKeywords, ''),
    openGraphImageId: toStringValue(metadata.openGraphImageId, ''),
    canonicalUrl: toStringValue(metadata.canonicalUrl, ''),
    seoTitleAr: record.seoTitleAr || toStringValue(metadata.seoTitleAr, ''),
    seoTitleEn: record.seoTitleEn || toStringValue(metadata.seoTitleEn, ''),
    seoDescAr: record.seoDescriptionAr || toStringValue(metadata.seoDescAr, ''),
    seoDescEn: record.seoDescriptionEn || toStringValue(metadata.seoDescEn, ''),
    inquiryMobile: toStringValue(metadata.inquiryMobile, ''),
    inquiryEmail: toStringValue(metadata.inquiryEmail, ''),
    inquiryMessageDefault: toStringValue(metadata.inquiryMessageDefault, ''),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};

export class PropertyService {
  async listProperties(query: { search?: string; status?: string; projectId?: string; featured?: boolean; page?: number; limit?: number }) {
    const records = await propertyRepository.listProperties();
    let items = records.map((record) => mapRecordToProperty(record as NonNullable<PropertyRecord>));

    if (query.search) {
      const search = query.search.trim().toLowerCase();
      items = items.filter((property) => {
        const haystack = [
          property.id,
          property.title?.ar,
          property.title?.en,
          property.description?.ar,
          property.description?.en,
          property.location?.ar,
          property.location?.en,
          property.district?.ar,
          property.district?.en,
          property.address?.ar,
          property.address?.en,
          property.unitNumber,
          property.unitCode,
          property.seoKeywords,
          property.seoTitleAr,
          property.seoTitleEn,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    if (query.status) {
      items = items.filter((property) => property.status === query.status);
    }

    if (query.projectId) {
      items = items.filter((property) => property.projectId === query.projectId);
    }

    if (typeof query.featured === 'boolean') {
      items = items.filter((property) => Boolean(property.featured) === query.featured);
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

  async getPropertyById(id: string) {
    const record = await propertyRepository.findPropertyById(id);
    if (!record) {
      throw new HttpError(404, 'Property not found');
    }
    return mapRecordToProperty(record as NonNullable<PropertyRecord>);
  }

  async createProperty(payload: PropertyCreateDTO, actorId?: string | null) {
    const normalized = await buildPropertyWriteData(payload);
    const data = normalized.data;
    const slugBase = data.slug;
    let slug = slugBase;
    let suffix = 2;
    while (await propertyRepository.findPropertyBySlug(slug)) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const record = await propertyRepository.createProperty({
      ...data,
      slug,
      createdById: actorId || null,
      updatedById: actorId || null,
    });

    await auditRepository.log({
      userId: actorId || undefined,
      action: 'PROPERTY_CREATED',
      entityType: 'Property',
      entityId: record.id,
      description: `Created property ${record.slug}`,
      newValues: normalized.metadata,
    });

    return mapRecordToProperty(record as NonNullable<PropertyRecord>);
  }

  async updateProperty(id: string, payload: PropertyUpdateDTO, actorId?: string | null) {
    const current = await propertyRepository.findPropertyById(id);
    if (!current) {
      throw new HttpError(404, 'Property not found');
    }

    const normalized = await buildPropertyWriteData(payload, current);
    const data = normalized.data;
    const record = await propertyRepository.updateProperty(id, {
      ...data,
      updatedById: actorId || null,
    });

    await auditRepository.log({
      userId: actorId || undefined,
      action: 'PROPERTY_UPDATED',
      entityType: 'Property',
      entityId: record.id,
      description: `Updated property ${record.slug}`,
      oldValues: current.metadata ?? current,
      newValues: normalized.metadata,
    });

    return mapRecordToProperty(record as NonNullable<PropertyRecord>);
  }

  async deleteProperty(id: string, actorId?: string | null) {
    const current = await propertyRepository.findPropertyById(id);
    if (!current) {
      throw new HttpError(404, 'Property not found');
    }

    const deleted = await propertyRepository.softDeleteProperty(id, actorId || null);

    await auditRepository.log({
      userId: actorId || undefined,
      action: 'PROPERTY_DELETED',
      entityType: 'Property',
      entityId: id,
      description: `Deleted property ${current.slug}`,
      oldValues: current.metadata ?? current,
      newValues: deleted.metadata ?? deleted,
    });

    return mapRecordToProperty(deleted as NonNullable<PropertyRecord>);
  }
}
