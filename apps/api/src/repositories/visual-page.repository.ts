import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type VisualPageRecord = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  status: string;
  sections: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
};

export type VisualPageVersionRecord = {
  id: string;
  visualPageId: string;
  versionName: string;
  data: Prisma.JsonValue;
  createdAt: Date;
};

export class VisualPageRepository {
  async listVisualPages() {
    console.log('Prisma operation', { action: 'visualPage.list' });
    return prisma.visualPage.findMany({
      where: { deletedAt: null },
      orderBy: [{ updatedAt: 'desc' }],
    }) as unknown as Promise<VisualPageRecord[]>;
  }

  async findVisualPageById(id: string) {
    console.log('Prisma operation', { action: 'visualPage.findById', id });
    return prisma.visualPage.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Promise<VisualPageRecord | null>;
  }

  async findVisualPageBySlug(slug: string) {
    console.log('Prisma operation', { action: 'visualPage.findBySlug', slug });
    return prisma.visualPage.findFirst({
      where: { slug, deletedAt: null },
    }) as unknown as Promise<VisualPageRecord | null>;
  }

  async createVisualPage(data: Prisma.VisualPageUncheckedCreateInput) {
    console.log('Prisma operation', { action: 'visualPage.create' });
    return prisma.visualPage.create({ data }) as unknown as Promise<VisualPageRecord>;
  }

  async updateVisualPage(id: string, data: Prisma.VisualPageUncheckedUpdateInput) {
    console.log('Prisma operation', { action: 'visualPage.update', id });
    return prisma.visualPage.update({
      where: { id },
      data,
    }) as unknown as Promise<VisualPageRecord>;
  }

  async softDeleteVisualPage(id: string, updatedById?: string | null) {
    console.log('Prisma operation', { action: 'visualPage.softDelete', id });
    return prisma.visualPage.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: updatedById || undefined,
      },
    }) as unknown as Promise<VisualPageRecord>;
  }

  async deleteVersions(visualPageId: string) {
    console.log('Prisma operation', { action: 'visualPage.deleteVersions', visualPageId });
    await prisma.visualPageVersion.deleteMany({
      where: { visualPageId },
    });
  }

  async listVersions(visualPageId: string) {
    console.log('Prisma operation', { action: 'visualPage.listVersions', visualPageId });
    return prisma.visualPageVersion.findMany({
      where: { visualPageId },
      orderBy: [{ createdAt: 'desc' }],
    }) as unknown as Promise<VisualPageVersionRecord[]>;
  }

  async findVersionById(versionId: string) {
    console.log('Prisma operation', { action: 'visualPage.findVersionById', versionId });
    return prisma.visualPageVersion.findFirst({
      where: { id: versionId },
    }) as unknown as Promise<VisualPageVersionRecord | null>;
  }

  async createVersion(data: Prisma.VisualPageVersionUncheckedCreateInput) {
    console.log('Prisma operation', { action: 'visualPage.createVersion', visualPageId: data.visualPageId });
    return prisma.visualPageVersion.create({ data }) as unknown as Promise<VisualPageVersionRecord>;
  }
}
