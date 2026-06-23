import { prisma } from '../config/prisma.js';

const MEDIA_INCLUDE = {
  folderRef: true,
  uploadedBy: {
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
    },
  },
  variants: true,
} as const;

export class MediaRepository {
  async createFolder(data: Parameters<typeof prisma.mediaFolder.create>[0]['data']) {
    return prisma.mediaFolder.create({ data });
  }

  async findFolderById(id: string) {
    return prisma.mediaFolder.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findFolderByPath(path: string) {
    return prisma.mediaFolder.findFirst({
      where: { path, deletedAt: null },
    });
  }

  async listFolders() {
    return prisma.mediaFolder.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: true,
      },
    });
  }

  async findMediaById(id: string, includeDeleted = false) {
    return prisma.mediaAsset.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: MEDIA_INCLUDE,
    });
  }

  async listMedia(params: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }) {
    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where: params.where as never,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy as never,
        include: MEDIA_INCLUDE,
      }),
      prisma.mediaAsset.count({
        where: params.where as never,
      }),
    ]);

    return { items, total };
  }

  async createMedia(data: Parameters<typeof prisma.mediaAsset.create>[0]['data']) {
    return prisma.mediaAsset.create({
      data,
      include: MEDIA_INCLUDE,
    });
  }

  async updateMedia(id: string, data: Record<string, unknown>) {
    return prisma.mediaAsset.update({
      where: { id },
      data: data as never,
      include: MEDIA_INCLUDE,
    });
  }

  async softDeleteMedia(id: string) {
    return prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: MEDIA_INCLUDE,
    });
  }

  async restoreMedia(id: string) {
    return prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: null },
      include: MEDIA_INCLUDE,
    });
  }

  async duplicateMedia(data: Parameters<typeof prisma.mediaAsset.create>[0]['data']) {
    return prisma.mediaAsset.create({
      data,
      include: MEDIA_INCLUDE,
    });
  }

  async moveMedia(id: string, data: Record<string, unknown>) {
    return prisma.mediaAsset.update({
      where: { id },
      data: data as never,
      include: MEDIA_INCLUDE,
    });
  }

  async bulkSoftDelete(ids: string[]) {
    return prisma.mediaAsset.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  }

  async createVariant(data: Parameters<typeof prisma.mediaVariant.create>[0]['data']) {
    return prisma.mediaVariant.create({ data });
  }

  async updateVariant(id: string, data: Record<string, unknown>) {
    return prisma.mediaVariant.update({
      where: { id },
      data: data as never,
    });
  }

  async listVariants(mediaId: string) {
    return prisma.mediaVariant.findMany({
      where: { mediaId, deletedAt: null },
    });
  }

  async deleteVariantsByMediaId(mediaId: string) {
    return prisma.mediaVariant.updateMany({
      where: { mediaId },
      data: { deletedAt: new Date() },
    });
  }
}
