import { Prisma } from '@prisma/client';
import { AuditRepository } from '../repositories/audit.repository.js';
import { InquiryRepository, type InquiryRecord } from '../repositories/inquiry.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { InquiryCreateDTO, InquiryStatusUpdateDTO } from '../validators/inquiry.validator.js';

const inquiryRepository = new InquiryRepository();
const auditRepository = new AuditRepository();

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const toInquiryStatus = (value: unknown, fallback: 'NEW' | 'CONTACTED' | 'CLOSED' = 'NEW') => {
  const raw = toStringValue(value, fallback).toUpperCase();
  if (raw === 'NEW' || raw === 'CONTACTED' || raw === 'CLOSED') {
    return raw;
  }
  return fallback;
};

const normalizeInquiry = (record: NonNullable<InquiryRecord>) => ({
  id: record.id,
  fullName: record.fullName,
  email: record.email || '',
  phone: record.phone || '',
  message: record.messageAr || record.messageEn || '',
  propertyId: record.propertyId || undefined,
  projectId: record.projectId || undefined,
  status: toStringValue(record.status, 'NEW').toLowerCase() as 'new' | 'contacted' | 'closed',
  createdAt: record.createdAt.toISOString(),
});

const buildInquiryWriteData = (payload: InquiryCreateDTO, record?: InquiryRecord) => {
  const message = toStringValue(payload.message, '').trim();
  const messageAr = toStringValue(payload.messageAr, message || record?.messageAr || '').trim();
  const messageEn = toStringValue(payload.messageEn, message || record?.messageEn || '').trim();

  return {
    data: {
      fullName: toStringValue(payload.fullName, record?.fullName || ''),
      email: payload.email || record?.email || null,
      phone: payload.phone || record?.phone || null,
      messageAr: messageAr || null,
      messageEn: messageEn || null,
      status: toInquiryStatus(payload.status, (record?.status as 'NEW' | 'CONTACTED' | 'CLOSED') || 'NEW'),
      propertyId: payload.propertyId || record?.propertyId || null,
      projectId: payload.projectId || record?.projectId || null,
      unitId: payload.unitId || record?.unitId || null,
      source: payload.source || record?.source || 'web',
    },
  };
};

export class InquiryService {
  async listInquiries() {
    const records = await inquiryRepository.listInquiries();
    return records.map((record) => normalizeInquiry(record as NonNullable<InquiryRecord>));
  }

  async createInquiry(payload: InquiryCreateDTO, actorId?: string | null) {
    const normalized = buildInquiryWriteData(payload);
    const created = await inquiryRepository.createInquiry({
      ...normalized.data,
      createdById: actorId || null,
      updatedById: actorId || null,
    });

    await auditRepository.log({
      userId: actorId || undefined,
      action: 'INQUIRY_CREATED',
      entityType: 'Inquiry',
      entityId: created.id,
      description: `Created inquiry from ${created.fullName}`,
      newValues: normalized.data as Prisma.InputJsonValue,
    });

    return normalizeInquiry(created as NonNullable<InquiryRecord>);
  }

  async updateStatus(id: string, payload: InquiryStatusUpdateDTO, actorId?: string | null) {
    const current = await inquiryRepository.findInquiryById(id);
    if (!current) {
      throw new HttpError(404, 'Inquiry not found');
    }

    const updated = await inquiryRepository.updateInquiry(id, {
      status: toInquiryStatus(payload.status),
      updatedById: actorId || null,
    });

    await auditRepository.log({
      userId: actorId || undefined,
      action: 'INQUIRY_STATUS_UPDATED',
      entityType: 'Inquiry',
      entityId: updated.id,
      description: `Updated inquiry status to ${payload.status}`,
      oldValues: current as unknown as Prisma.InputJsonValue,
      newValues: updated as unknown as Prisma.InputJsonValue,
    });

    return normalizeInquiry(updated as NonNullable<InquiryRecord>);
  }

  async deleteInquiry(id: string, actorId?: string | null) {
    const current = await inquiryRepository.findInquiryById(id);
    if (!current) {
      throw new HttpError(404, 'Inquiry not found');
    }

    const deleted = await inquiryRepository.softDeleteInquiry(id, actorId || null);

    await auditRepository.log({
      userId: actorId || undefined,
      action: 'INQUIRY_DELETED',
      entityType: 'Inquiry',
      entityId: deleted.id,
      description: `Deleted inquiry from ${deleted.fullName}`,
      oldValues: current as unknown as Prisma.InputJsonValue,
      newValues: deleted as unknown as Prisma.InputJsonValue,
    });

    return normalizeInquiry(deleted as NonNullable<InquiryRecord>);
  }
}
