import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type InquiryRecord = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  messageAr: string | null;
  messageEn: string | null;
  status: string;
  propertyId: string | null;
  projectId: string | null;
  unitId: string | null;
  leadId: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
};

export class InquiryRepository {
  async listInquiries() {
    return prisma.inquiry.findMany({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }],
    }) as unknown as Promise<InquiryRecord[]>;
  }

  async findInquiryById(id: string) {
    return prisma.inquiry.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Promise<InquiryRecord | null>;
  }

  async createInquiry(data: Prisma.InquiryUncheckedCreateInput) {
    return prisma.inquiry.create({ data }) as unknown as Promise<InquiryRecord>;
  }

  async updateInquiry(id: string, data: Prisma.InquiryUncheckedUpdateInput) {
    return prisma.inquiry.update({
      where: { id },
      data,
    }) as unknown as Promise<InquiryRecord>;
  }

  async softDeleteInquiry(id: string, updatedById?: string | null) {
    return prisma.inquiry.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: updatedById || undefined,
      },
    }) as unknown as Promise<InquiryRecord>;
  }
}
