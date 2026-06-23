import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

export type MediaCategoryKey =
  | 'image'
  | 'video'
  | 'document'
  | 'floorplan'
  | 'avatar'
  | 'blog'
  | 'seo'
  | 'gallery'
  | 'other';

export type MediaCategoryDir =
  | 'images'
  | 'videos'
  | 'documents'
  | 'floorplans'
  | 'avatars'
  | 'blog'
  | 'seo'
  | 'gallery'
  | 'other'
  | 'temp';

export const CATEGORY_DIR_MAP: Record<MediaCategoryKey, MediaCategoryDir> = {
  image: 'images',
  video: 'videos',
  document: 'documents',
  floorplan: 'floorplans',
  avatar: 'avatars',
  blog: 'blog',
  seo: 'seo',
  gallery: 'gallery',
  other: 'other',
};

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'svg'] as const;
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'] as const;
export const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xlsx'] as const;
export const ALLOWED_FLOORPLAN_EXTENSIONS = ['jpg', 'png', 'pdf'] as const;

export const IMAGE_MAX_SIZE = 20 * 1024 * 1024;
export const VIDEO_MAX_SIZE = 500 * 1024 * 1024;
export const DOCUMENT_MAX_SIZE = 50 * 1024 * 1024;

export const MEDIA_BASE_PATH = path.resolve(process.cwd(), env.UPLOAD_DIR);

export const sanitizeFileName = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

export const ensureDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
};

export const ensureMediaStorageLayout = () => {
  const dirs: Array<MediaCategoryDir | 'temp'> = [
    'images',
    'videos',
    'documents',
    'floorplans',
    'avatars',
    'blog',
    'seo',
    'gallery',
    'other',
    'temp',
  ];
  ensureDir(MEDIA_BASE_PATH);
  dirs.forEach((dir) => ensureDir(path.join(MEDIA_BASE_PATH, dir)));
};

export const getCategoryDir = (category: MediaCategoryKey): MediaCategoryDir => CATEGORY_DIR_MAP[category];

export const getYearMonthPath = (date = new Date()) => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return path.join(year, month);
};

export const buildMediaDirectory = (category: MediaCategoryKey, date = new Date(), folderPath?: string | null) => {
  const segments = [MEDIA_BASE_PATH, getCategoryDir(category), getYearMonthPath(date)];
  if (folderPath) {
    segments.push(...folderPath.split('/').filter(Boolean));
  }
  return path.join(...segments);
};

export const buildTempUploadDirectory = () => path.join(MEDIA_BASE_PATH, 'temp');

export const buildMediaRelativePath = (category: MediaCategoryKey, fileName: string, date = new Date(), folderPath?: string | null) => {
  const segments = [getCategoryDir(category), getYearMonthPath(date).replace(/\\/g, '/')];
  if (folderPath) {
    segments.push(...folderPath.split('/').filter(Boolean));
  }
  segments.push(fileName);
  return path.posix.join(...segments);
};

export const buildMediaAbsolutePath = (relativePath: string) => path.resolve(MEDIA_BASE_PATH, relativePath);

export const buildMediaPublicUrl = (mediaId: string) => `/api/media/${mediaId}/file`;

export const buildMediaDownloadUrl = (mediaId: string) => `/api/media/${mediaId}/download`;
