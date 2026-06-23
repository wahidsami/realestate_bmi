import { z } from 'zod';

const mediaCategorySchema = z.enum([
  'image',
  'video',
  'document',
  'floorplan',
  'avatar',
  'blog',
  'seo',
  'gallery',
  'other',
]);

export const mediaUploadSchema = z.object({
  category: mediaCategorySchema.default('other'),
  folderId: z.string().optional().nullable(),
  folder: z.string().optional().nullable(),
  altTextAr: z.string().optional().nullable(),
  altTextEn: z.string().optional().nullable(),
  captionAr: z.string().optional().nullable(),
  captionEn: z.string().optional().nullable(),
  titleAr: z.string().optional().nullable(),
  titleEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  isPublic: z.coerce.boolean().default(false),
});

export const mediaUpdateSchema = z.object({
  originalName: z.string().optional(),
  folderId: z.string().optional().nullable(),
  folder: z.string().optional().nullable(),
  altTextAr: z.string().optional().nullable(),
  altTextEn: z.string().optional().nullable(),
  captionAr: z.string().optional().nullable(),
  captionEn: z.string().optional().nullable(),
  titleAr: z.string().optional().nullable(),
  titleEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  isPublic: z.boolean().optional(),
  category: mediaCategorySchema.optional(),
});

export const mediaMoveSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  folderId: z.string().optional().nullable(),
  folder: z.string().optional().nullable(),
});

export const mediaDuplicateSchema = z.object({
  id: z.string().min(1),
  folderId: z.string().optional().nullable(),
  folder: z.string().optional().nullable(),
});

export const mediaBulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const mediaBulkDownloadSchema = mediaBulkDeleteSchema;

export const mediaRestoreSchema = z.object({
  id: z.string().min(1).optional(),
  ids: z.array(z.string().min(1)).optional(),
});

export const mediaFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

export const mediaListQuerySchema = z.object({
  search: z.string().optional(),
  category: mediaCategorySchema.optional(),
  folderId: z.string().optional(),
  extension: z.string().optional(),
  uploadedBy: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isPublic: z.coerce.boolean().optional(),
  deleted: z.coerce.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'originalName', 'fileSize']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(24),
});

export const mediaFileQuerySchema = z.object({
  variant: z.enum(['thumbnail', 'medium', 'large', 'web']).optional(),
});
