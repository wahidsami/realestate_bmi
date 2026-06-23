import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export type ProjectRecord = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  developerAr: string | null;
  developerEn: string | null;
  cityAr: string | null;
  cityEn: string | null;
  districtAr: string | null;
  districtEn: string | null;
  addressAr: string | null;
  addressEn: string | null;
  completionDate: Date | null;
  status: string;
  unitCount: number;
  featured: boolean;
  coverMediaId: string | null;
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  seoKeywords: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  categoryId: string | null;
};

export class ProjectRepository {
  async listProjects() {
    return prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
    }) as unknown as Promise<ProjectRecord[]>;
  }

  async findProjectById(id: string) {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Promise<ProjectRecord | null>;
  }

  async findProjectBySlug(slug: string) {
    return prisma.project.findFirst({
      where: { slug, deletedAt: null },
    }) as unknown as Promise<ProjectRecord | null>;
  }

  async createProject(data: Prisma.ProjectUncheckedCreateInput) {
    return prisma.project.create({ data }) as unknown as Promise<ProjectRecord>;
  }

  async updateProject(id: string, data: Prisma.ProjectUncheckedUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
    }) as unknown as Promise<ProjectRecord>;
  }

  async softDeleteProject(id: string, updatedById?: string | null) {
    return prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: updatedById || undefined,
      },
    }) as unknown as Promise<ProjectRecord>;
  }
}
