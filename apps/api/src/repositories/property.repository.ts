import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type PropertyRecord = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: Prisma.Decimal;
  currency: string;
  status: string;
  saleOrRent: string;
  featured: boolean;
  projectId: string | null;
  categoryId: string | null;
  featuredMediaId: string | null;
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  seoKeywords: string | null;
  listingDate: Date | null;
  publishedAt: Date | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
};

export class PropertyRepository {
  async listProperties() {
    return prisma.property.findMany({
      where: { deletedAt: null },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    }) as unknown as Promise<PropertyRecord[]>;
  }

  async findPropertyById(id: string) {
    return prisma.property.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Promise<PropertyRecord | null>;
  }

  async findPropertyBySlug(slug: string) {
    return prisma.property.findFirst({
      where: { slug, deletedAt: null },
    }) as unknown as Promise<PropertyRecord | null>;
  }

  async createProperty(data: Prisma.PropertyUncheckedCreateInput) {
    return prisma.property.create({ data }) as unknown as Promise<PropertyRecord>;
  }

  async updateProperty(id: string, data: Prisma.PropertyUncheckedUpdateInput) {
    return prisma.property.update({
      where: { id },
      data,
    }) as unknown as Promise<PropertyRecord>;
  }

  async softDeleteProperty(id: string, updatedById?: string | null) {
    return prisma.property.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: updatedById || undefined,
      },
    }) as unknown as Promise<PropertyRecord>;
  }
}
