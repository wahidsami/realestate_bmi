import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type PageRecord = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string | null;
  subtitleEn: string | null;
  contentAr: string | null;
  contentEn: string | null;
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  status: string;
  parentId: string | null;
  metadata: Prisma.JsonValue | null;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
};

export class PageRepository {
  async listPages() {
    console.log('Prisma operation', { action: 'page.list' });
    return prisma.page.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    }) as unknown as Promise<PageRecord[]>;
  }

  async findPageById(id: string) {
    console.log('Prisma operation', { action: 'page.findById', id });
    return prisma.page.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Promise<PageRecord | null>;
  }

  async findPageBySlug(slug: string) {
    console.log('Prisma operation', { action: 'page.findBySlug', slug });
    return prisma.page.findFirst({
      where: { slug, deletedAt: null },
    }) as unknown as Promise<PageRecord | null>;
  }

  async createPage(data: Prisma.PageUncheckedCreateInput) {
    console.log('Prisma operation', { action: 'page.create' });
    return prisma.page.create({ data }) as unknown as Promise<PageRecord>;
  }

  async updatePage(id: string, data: Prisma.PageUncheckedUpdateInput) {
    console.log('Prisma operation', { action: 'page.update', id });
    return prisma.page.update({
      where: { id },
      data,
    }) as unknown as Promise<PageRecord>;
  }

  async softDeletePage(id: string, updatedById?: string | null) {
    console.log('Prisma operation', { action: 'page.softDelete', id });
    return prisma.page.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: updatedById || undefined,
      },
    }) as unknown as Promise<PageRecord>;
  }
}
