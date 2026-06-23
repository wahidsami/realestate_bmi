import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import { prisma } from '../config/prisma.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { MediaRepository } from '../repositories/media.repository.js';
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_FLOORPLAN_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_EXTENSIONS,
  buildMediaAbsolutePath,
  buildMediaDirectory,
  buildMediaPublicUrl,
  buildMediaRelativePath,
  ensureDir,
  sanitizeFileName,
} from '../utils/mediaStorage.js';
import { isExecutableExtension } from '../utils/fileType.js';
import { HttpError } from '../utils/httpError.js';
import type { MediaCategory, MediaSortField, MediaVariantKey } from '../types/media.js';

const mediaRepository = new MediaRepository();
const auditRepository = new AuditRepository();

const CATEGORY_MAP: Record<MediaCategory, 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'FLOORPLAN' | 'AVATAR' | 'SEO' | 'GALLERY' | 'OTHER'> = {
  image: 'IMAGE',
  video: 'VIDEO',
  document: 'DOCUMENT',
  floorplan: 'FLOORPLAN',
  avatar: 'AVATAR',
  blog: 'OTHER',
  seo: 'SEO',
  gallery: 'GALLERY',
  other: 'OTHER',
};

const VARIANT_MAP = {
  thumbnail: 'THUMBNAIL',
  medium: 'MEDIUM',
  large: 'LARGE',
  web: 'WEB',
} as const;

const CATEGORY_ALIASES = new Set<MediaCategory>(['image', 'video', 'document', 'floorplan', 'avatar', 'seo', 'gallery', 'other', 'blog']);

const IMAGE_VARIANTS: Array<{ key: MediaVariantKey; width: number; quality: number }> = [
  { key: 'thumbnail', width: 320, quality: 72 },
  { key: 'medium', width: 1024, quality: 78 },
  { key: 'large', width: 1600, quality: 82 },
  { key: 'web', width: 1920, quality: 84 },
];

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const resolveExtension = (originalName: string) => {
  const ext = path.extname(originalName).replace('.', '').toLowerCase();
  return ext;
};

const validateMediaFile = (extension: string, mimeType: string, category: MediaCategory, size: number) => {
  if (isExecutableExtension(extension)) {
    throw new HttpError(400, 'Executable files are not allowed');
  }

  const allowedByCategory: Record<MediaCategory, string[]> = {
    image: [...ALLOWED_IMAGE_EXTENSIONS],
    video: [...ALLOWED_VIDEO_EXTENSIONS],
    document: [...ALLOWED_DOCUMENT_EXTENSIONS],
    floorplan: [...ALLOWED_FLOORPLAN_EXTENSIONS],
    avatar: [...ALLOWED_IMAGE_EXTENSIONS],
    blog: [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_DOCUMENT_EXTENSIONS],
    seo: [...ALLOWED_IMAGE_EXTENSIONS],
    gallery: [...ALLOWED_IMAGE_EXTENSIONS],
    other: [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS, ...ALLOWED_DOCUMENT_EXTENSIONS, ...ALLOWED_FLOORPLAN_EXTENSIONS],
  };

  const isAllowed = allowedByCategory[category].includes(extension);
  if (!isAllowed) {
    throw new HttpError(400, `Unsupported file extension for ${category}`);
  }

  if (category === 'image' || category === 'avatar' || category === 'gallery' || category === 'seo') {
    if (size > 20 * 1024 * 1024) throw new HttpError(400, 'Image file size exceeds 20MB');
    if (!mimeType.startsWith('image/')) throw new HttpError(400, 'Invalid image MIME type');
  } else if (category === 'video') {
    if (size > 500 * 1024 * 1024) throw new HttpError(400, 'Video file size exceeds 500MB');
    if (!mimeType.startsWith('video/')) throw new HttpError(400, 'Invalid video MIME type');
  } else if (category === 'document' || category === 'floorplan') {
    if (size > 50 * 1024 * 1024) throw new HttpError(400, 'Document file size exceeds 50MB');
  }
};

const buildStoredBaseName = (originalName: string) => {
  const safeName = sanitizeFileName(originalName);
  const ext = resolveExtension(originalName);
  const base = safeName.replace(new RegExp(`\\.${ext}$`, 'i'), '');
  return `${Date.now()}-${crypto.randomUUID()}-${base}`.replace(/\.+/g, '.');
};

const moveFile = async (source: string, destination: string) => {
  if (path.resolve(source) === path.resolve(destination)) {
    return;
  }
  await ensureDir(path.dirname(destination));
  await fs.rename(source, destination);
};

const copyFile = async (source: string, destination: string) => {
  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
};

const extractImageMetadata = async (filePath: string) => {
  const [meta, stats] = await Promise.all([sharp(filePath).metadata(), sharp(filePath).stats()]);
  const dominant = stats.dominant;
  const dominantColor = dominant
    ? `#${[dominant.r, dominant.g, dominant.b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
    : undefined;
  return {
    width: meta.width ?? undefined,
    height: meta.height ?? undefined,
    dominantColor,
  };
};

const categoryToPrisma = (category: MediaCategory) => CATEGORY_MAP[category];

const prismaToCategory = (category: string): MediaCategory => {
  switch (category) {
    case 'IMAGE':
      return 'image';
    case 'VIDEO':
      return 'video';
    case 'DOCUMENT':
      return 'document';
    case 'FLOORPLAN':
      return 'floorplan';
    case 'AVATAR':
      return 'avatar';
    case 'SEO':
      return 'seo';
    case 'GALLERY':
      return 'gallery';
    default:
      return 'other';
  }
};

const buildFolderString = (folderPath?: string | null, folderName?: string | null) => {
  if (folderPath) {
    return folderPath;
  }

  if (folderName) {
    return folderName;
  }

  return null;
};

export class MediaService {
  async createFolder(input: { name: string; parentId?: string | null; userId?: string | null }) {
    let parentPath = '';
    if (input.parentId) {
      const parent = await mediaRepository.findFolderById(input.parentId);
      if (!parent) {
        throw new HttpError(404, 'Parent folder not found');
      }
      parentPath = parent.path;
    }

    const slug = input.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const pathValue = parentPath ? `${parentPath}/${slug}` : slug;

    const folder = await mediaRepository.createFolder({
      name: input.name.trim(),
      path: pathValue,
      slug,
      parentId: input.parentId || null,
      createdById: input.userId || null,
      updatedById: input.userId || null,
    });

    await auditRepository.log({
      userId: input.userId || undefined,
      action: 'MEDIA_FOLDER_CREATED',
      entityType: 'MediaFolder',
      entityId: folder.id,
      description: `Created media folder ${folder.name}`,
    });

    return folder;
  }

  async listFolders() {
    return mediaRepository.listFolders();
  }

  async listMedia(query: {
    search?: string;
    category?: MediaCategory;
    folderId?: string;
    extension?: string;
    uploadedBy?: string;
    tags?: string | string[];
    isPublic?: boolean;
    deleted?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: MediaSortField;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (query.deleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (query.category) {
      where.category = categoryToPrisma(query.category);
    }

    if (query.folderId) {
      where.folderId = query.folderId;
    }

    if (query.extension) {
      where.extension = query.extension.toLowerCase();
    }

    if (query.uploadedBy) {
      where.uploadedById = query.uploadedBy;
    }

    if (typeof query.isPublic === 'boolean') {
      where.isPublic = query.isPublic;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    if (query.tags) {
      where.tags = { hasSome: parseTags(query.tags) };
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { altTextAr: { contains: search, mode: 'insensitive' } },
        { altTextEn: { contains: search, mode: 'insensitive' } },
        { captionAr: { contains: search, mode: 'insensitive' } },
        { captionEn: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 24);
    const take = query.limit || 24;

    return mediaRepository.listMedia({
      where,
      skip,
      take,
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
    });
  }

  async getMediaById(id: string, includeDeleted = false) {
    const media = await mediaRepository.findMediaById(id, includeDeleted);
    if (!media) {
      throw new HttpError(404, 'Media item not found');
    }
    return media;
  }

  async createMediaFolderName(folderId?: string | null, folder?: string | null) {
    if (folderId) {
      const folderRecord = await mediaRepository.findFolderById(folderId);
      if (!folderRecord) {
        throw new HttpError(404, 'Media folder not found');
      }
      return folderRecord.path;
    }

    return buildFolderString(folder || null, folder || null);
  }

  private async processUploadFile(args: {
    file: Express.Multer.File;
    category: MediaCategory;
    folderPath?: string | null;
    folderId?: string | null;
    isPublic: boolean;
    userId?: string | null;
    metadata: Record<string, unknown>;
  }) {
    const extension = resolveExtension(args.file.originalname);
    validateMediaFile(extension, args.file.mimetype, args.category, args.file.size);

    const folderRecord = args.folderId ? await mediaRepository.findFolderById(args.folderId) : null;
    if (args.folderId && !folderRecord) {
      throw new HttpError(404, 'Media folder not found');
    }

    const folderPath = folderRecord?.path ?? args.folderPath ?? null;
    const uploadDate = new Date();
    const finalDir = buildMediaDirectory(args.category, uploadDate, folderPath);
    await fs.mkdir(finalDir, { recursive: true });

    const baseName = buildStoredBaseName(args.file.originalname);
    const storedName = `${baseName}.${extension || 'bin'}`;
    const finalFilePath = path.join(finalDir, storedName);
    const relativePath = buildMediaRelativePath(args.category, storedName, uploadDate, folderPath);

    await moveFile(args.file.path, finalFilePath);

    let width: number | undefined;
    let height: number | undefined;
    let dominantColor: string | undefined;
    const variants: Array<{
      variant: MediaVariantKey;
      filePath: string;
      publicUrl: string;
      mimeType: string;
      fileSize: number;
      width?: number;
      height?: number;
    }> = [];

    if (args.category === 'image' || args.category === 'avatar' || args.category === 'gallery' || args.category === 'seo' || args.category === 'floorplan') {
      const imageMeta = await extractImageMetadata(finalFilePath);
      width = imageMeta.width;
      height = imageMeta.height;
      dominantColor = imageMeta.dominantColor;

      if (args.category !== 'floorplan' || ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        for (const variant of IMAGE_VARIANTS) {
          const variantName = `${baseName}-${variant.key}.webp`;
          const variantPath = path.join(finalDir, variantName);
          await sharp(finalFilePath)
            .resize({ width: variant.width, withoutEnlargement: true })
            .webp({ quality: variant.quality })
            .toFile(variantPath);

          const stat = await fs.stat(variantPath);
          variants.push({
            variant: variant.key,
            filePath: buildMediaRelativePath(args.category, variantName, uploadDate, folderPath),
            publicUrl: '',
            mimeType: 'image/webp',
            fileSize: stat.size,
            width: variant.width,
          });
        }
      }
    }

    const created = await mediaRepository.createMedia({
      originalName: args.file.originalname,
      storedName,
      filePath: relativePath,
      publicUrl: buildMediaPublicUrl('tmp'),
      mimeType: args.file.mimetype,
      extension,
      category: categoryToPrisma(args.category),
      fileSize: args.file.size,
      width,
      height,
      altTextAr: typeof args.metadata.altTextAr === 'string' ? args.metadata.altTextAr : null,
      altTextEn: typeof args.metadata.altTextEn === 'string' ? args.metadata.altTextEn : null,
      captionAr: typeof args.metadata.captionAr === 'string' ? args.metadata.captionAr : null,
      captionEn: typeof args.metadata.captionEn === 'string' ? args.metadata.captionEn : null,
      titleAr: typeof args.metadata.titleAr === 'string' ? args.metadata.titleAr : null,
      titleEn: typeof args.metadata.titleEn === 'string' ? args.metadata.titleEn : null,
      descriptionAr: typeof args.metadata.descriptionAr === 'string' ? args.metadata.descriptionAr : null,
      descriptionEn: typeof args.metadata.descriptionEn === 'string' ? args.metadata.descriptionEn : null,
      folder: folderPath,
      tags: parseTags(args.metadata.tags),
      dominantColor,
      isPublic: args.isPublic,
      uploadedById: args.userId || null,
      folderId: args.folderId || null,
    });

    const variantCreates = await Promise.all(
      variants.map((variant) =>
        mediaRepository.createVariant({
          mediaId: created.id,
          variant: VARIANT_MAP[variant.variant],
          filePath: variant.filePath,
          publicUrl: `/api/media/${created.id}/variants/${variant.variant}`,
          mimeType: variant.mimeType,
          fileSize: variant.fileSize,
          width: variant.width || null,
          height: height || null,
        }),
      ),
    );

    const media = await mediaRepository.updateMedia(created.id, {
      publicUrl: buildMediaPublicUrl(created.id),
    });

    await auditRepository.log({
      userId: args.userId || undefined,
      action: 'MEDIA_UPLOADED',
      entityType: 'Media',
      entityId: created.id,
      description: `Uploaded ${args.file.originalname}`,
      newValues: { media: media, variants: variantCreates.length },
    });

    return await mediaRepository.findMediaById(created.id, true);
  }

  async uploadMedia(files: Express.Multer.File[], payload: any, userId?: string | null) {
    if (!files?.length) {
      throw new HttpError(400, 'No files were uploaded');
    }

    const category = (payload.category || 'other') as MediaCategory;
    if (!CATEGORY_ALIASES.has(category)) {
      throw new HttpError(400, 'Invalid media category');
    }

    const folderPath = await this.createMediaFolderName(payload.folderId || null, payload.folder || null);

    const results = [];
    for (const file of files) {
      const result = await this.processUploadFile({
        file,
        category,
        folderPath,
        folderId: payload.folderId || null,
        isPublic: Boolean(payload.isPublic),
        userId,
        metadata: payload,
      });
      results.push(result);
    }

    return results;
  }

  async updateMedia(id: string, data: any, userId?: string | null) {
    const current = await this.getMediaById(id);
    const folderPath = await this.createMediaFolderName(data.folderId || null, data.folder || current.folder || null);
    const updated = await mediaRepository.updateMedia(id, {
      originalName: data.originalName ?? current.originalName,
      folderId: data.folderId === undefined ? current.folderId : data.folderId,
      folder: folderPath,
      altTextAr: data.altTextAr ?? current.altTextAr,
      altTextEn: data.altTextEn ?? current.altTextEn,
      captionAr: data.captionAr ?? current.captionAr,
      captionEn: data.captionEn ?? current.captionEn,
      titleAr: data.titleAr ?? current.titleAr,
      titleEn: data.titleEn ?? current.titleEn,
      descriptionAr: data.descriptionAr ?? current.descriptionAr,
      descriptionEn: data.descriptionEn ?? current.descriptionEn,
      tags: data.tags ? parseTags(data.tags) : current.tags,
      isPublic: typeof data.isPublic === 'boolean' ? data.isPublic : current.isPublic,
      category: data.category ? categoryToPrisma(data.category) : current.category,
      updatedById: userId || null,
    });

    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_UPDATED',
      entityType: 'Media',
      entityId: id,
      description: `Updated ${updated.originalName}`,
      oldValues: current,
      newValues: updated,
    });

    return updated;
  }

  async softDeleteMedia(id: string, userId?: string | null) {
    const current = await this.getMediaById(id);
    const updated = await mediaRepository.softDeleteMedia(id);

    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_DELETED',
      entityType: 'Media',
      entityId: id,
      description: `Deleted ${current.originalName}`,
      oldValues: current,
      newValues: updated,
    });

    return updated;
  }

  async restoreMedia(id: string, userId?: string | null) {
    const current = await this.getMediaById(id, true);
    const restored = await mediaRepository.restoreMedia(id);

    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_RESTORED',
      entityType: 'Media',
      entityId: id,
      description: `Restored ${current.originalName}`,
      oldValues: current,
      newValues: restored,
    });

    return restored;
  }

  async bulkDeleteMedia(ids: string[], userId?: string | null) {
    const result = await mediaRepository.bulkSoftDelete(ids);
    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_BULK_DELETED',
      entityType: 'Media',
      description: `Bulk deleted ${ids.length} media records`,
      newValues: { ids, result },
    });
    return result;
  }

  async moveMedia(ids: string[], folderId?: string | null, folderPath?: string | null, userId?: string | null) {
    const folderRecord = folderId ? await mediaRepository.findFolderById(folderId) : null;
    if (folderId && !folderRecord) {
      throw new HttpError(404, 'Media folder not found');
    }
    const targetFolderPath = folderRecord?.path ?? folderPath ?? null;
    const moved: any[] = [];

    for (const id of ids) {
      const media = await this.getMediaById(id);
      const oldDiskPath = buildMediaAbsolutePath(media.filePath);
      const nextRelativePath = buildMediaRelativePath(prismaToCategory(media.category), media.storedName, media.createdAt, targetFolderPath);
      const nextDiskPath = buildMediaAbsolutePath(nextRelativePath);

      await moveFile(oldDiskPath, nextDiskPath);
      await mediaRepository.moveMedia(id, {
        folderId: folderId || null,
        folder: targetFolderPath,
        filePath: nextRelativePath,
        updatedById: userId || null,
      });

      const variants = await mediaRepository.listVariants(id);
      for (const variant of variants) {
        const oldVariantPath = buildMediaAbsolutePath(variant.filePath);
        const nextVariantName = `${path.parse(media.storedName).name}-${variant.variant.toLowerCase()}.webp`;
        const nextVariantRelativePath = buildMediaRelativePath(prismaToCategory(media.category), nextVariantName, media.createdAt, targetFolderPath);
        const nextVariantDiskPath = buildMediaAbsolutePath(nextVariantRelativePath);

        await moveFile(oldVariantPath, nextVariantDiskPath);
        await mediaRepository.updateVariant(variant.id, {
          filePath: nextVariantRelativePath,
          publicUrl: `/api/media/${media.id}/variants/${variant.variant.toString().toLowerCase()}`,
        });
      }

      moved.push(id);
    }

    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_MOVED',
      entityType: 'Media',
      description: `Moved ${moved.length} media items`,
      newValues: { ids: moved, folderId, folderPath: targetFolderPath },
    });

    return { moved };
  }

  async duplicateMedia(id: string, folderId?: string | null, folderPath?: string | null, userId?: string | null) {
    const media = await this.getMediaById(id, true);
    const folderRecord = folderId ? await mediaRepository.findFolderById(folderId) : null;
    if (folderId && !folderRecord) {
      throw new HttpError(404, 'Media folder not found');
    }

    const targetFolderPath = folderRecord?.path ?? folderPath ?? media.folder ?? null;
    const baseName = buildStoredBaseName(media.originalName);
    const newStoredName = `${baseName}.${media.extension}`;
    const sourceDiskPath = buildMediaAbsolutePath(media.filePath);
    const finalDir = buildMediaDirectory(prismaToCategory(media.category), media.createdAt, targetFolderPath);
    await fs.mkdir(finalDir, { recursive: true });

    const newFilePath = path.join(finalDir, newStoredName);
    await copyFile(sourceDiskPath, newFilePath);
    const stat = await fs.stat(newFilePath);

    const duplicated = await mediaRepository.duplicateMedia({
      originalName: media.originalName,
      storedName: newStoredName,
      filePath: buildMediaRelativePath(prismaToCategory(media.category), newStoredName, media.createdAt, targetFolderPath),
      publicUrl: buildMediaPublicUrl('tmp'),
      mimeType: media.mimeType,
      extension: media.extension,
      category: media.category,
      fileSize: stat.size,
      width: media.width,
      height: media.height,
      duration: media.duration,
      altTextAr: media.altTextAr,
      altTextEn: media.altTextEn,
      captionAr: media.captionAr,
      captionEn: media.captionEn,
      titleAr: media.titleAr,
      titleEn: media.titleEn,
      descriptionAr: media.descriptionAr,
      descriptionEn: media.descriptionEn,
      folder: targetFolderPath,
      tags: media.tags || [],
      dominantColor: media.dominantColor,
      isPublic: media.isPublic,
      uploadedById: userId || media.uploadedById || null,
      folderId: folderId || media.folderId || null,
    });

    const sourceVariants = await mediaRepository.listVariants(media.id);
    for (const variant of sourceVariants) {
      const variantPath = buildMediaAbsolutePath(variant.filePath);
      const targetVariantName = `${path.parse(newStoredName).name}-${variant.variant.toLowerCase()}.webp`;
      const targetVariantPath = path.join(finalDir, targetVariantName);
      await copyFile(variantPath, targetVariantPath);
      await mediaRepository.createVariant({
        mediaId: duplicated.id,
        variant: variant.variant,
        filePath: buildMediaRelativePath(prismaToCategory(media.category), targetVariantName, media.createdAt, targetFolderPath),
        publicUrl: `/api/media/${duplicated.id}/variants/${variant.variant.toString().toLowerCase()}`,
        mimeType: variant.mimeType,
        fileSize: variant.fileSize,
        width: variant.width,
        height: variant.height,
      });
    }

    const updated = await mediaRepository.updateMedia(duplicated.id, {
      publicUrl: buildMediaPublicUrl(duplicated.id),
    });

    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_DUPLICATED',
      entityType: 'Media',
      entityId: duplicated.id,
      description: `Duplicated ${media.originalName}`,
      oldValues: media,
      newValues: updated,
    });

    return updated;
  }

  async resolveMediaFile(mediaId: string, userId?: string | null, variant?: MediaVariantKey) {
    const media = await this.getMediaById(mediaId, true);
    if (media.deletedAt && !userId) {
      throw new HttpError(404, 'Media file not found');
    }
    const canAccess = media.isPublic || Boolean(userId);
    if (!canAccess) {
      throw new HttpError(401, 'Private media requires authentication');
    }

    if (variant) {
      const record = await prisma.mediaVariant.findFirst({
        where: { mediaId, variant: VARIANT_MAP[variant], deletedAt: null },
      });
      if (!record) {
        throw new HttpError(404, 'Media variant not found');
      }

      const abs = buildMediaAbsolutePath(record.filePath);
      return { media, filePath: abs, mimeType: record.mimeType, downloadName: media.originalName };
    }

    const abs = buildMediaAbsolutePath(media.filePath);
    return { media, filePath: abs, mimeType: media.mimeType, downloadName: media.originalName };
  }

  async logDownload(mediaId: string, userId?: string | null) {
    const media = await this.getMediaById(mediaId, true);
    await auditRepository.log({
      userId: userId || undefined,
      action: 'MEDIA_DOWNLOADED',
      entityType: 'Media',
      entityId: mediaId,
      description: `Downloaded ${media.originalName}`,
      newValues: { mediaId },
    });
    return media;
  }
}
