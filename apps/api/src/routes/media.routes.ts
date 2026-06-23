import { Router } from 'express';
import { upload } from '../config/upload.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import {
  bulkDeleteMedia,
  bulkDownloadMedia,
  createFolder,
  deleteMedia,
  downloadMedia,
  duplicateMedia,
  getMedia,
  listFolders,
  listMedia,
  listPublicMedia,
  moveMedia,
  restoreMedia,
  serveMediaFile,
  serveMediaVariant,
  updateMedia,
  uploadMultiple,
  uploadSingle,
} from '../controllers/media.controller.js';

export const mediaRouter = Router();

mediaRouter.get('/public', listPublicMedia as any);
mediaRouter.get('/', authenticate as any, authorize('media.download', 'media.manage') as any, listMedia as any);
mediaRouter.get('/folders', authenticate as any, authorize('media.manage') as any, listFolders as any);
mediaRouter.post('/folders', authenticate as any, authorize('media.manage') as any, createFolder as any);
mediaRouter.post('/upload', authenticate as any, authorize('media.upload', 'media.manage') as any, upload.single('file') as any, uploadSingle as any);
mediaRouter.post('/multiple-upload', authenticate as any, authorize('media.upload', 'media.manage') as any, upload.array('files', 50) as any, uploadMultiple as any);
mediaRouter.get('/:id', authenticate as any, authorize('media.download', 'media.manage') as any, getMedia as any);
mediaRouter.patch('/:id', authenticate as any, authorize('media.edit', 'media.manage') as any, updateMedia as any);
mediaRouter.delete('/:id', authenticate as any, authorize('media.delete', 'media.manage') as any, deleteMedia as any);
mediaRouter.post('/move', authenticate as any, authorize('media.edit', 'media.manage') as any, moveMedia as any);
mediaRouter.post('/duplicate', authenticate as any, authorize('media.edit', 'media.manage') as any, duplicateMedia as any);
mediaRouter.post('/bulk-delete', authenticate as any, authorize('media.delete', 'media.manage') as any, bulkDeleteMedia as any);
mediaRouter.post('/bulk-download', authenticate as any, authorize('media.download', 'media.manage') as any, bulkDownloadMedia as any);
mediaRouter.post('/:id/restore', authenticate as any, authorize('media.restore', 'media.manage') as any, restoreMedia as any);
mediaRouter.get('/:id/file', serveMediaFile as any);
mediaRouter.get('/:id/download', downloadMedia as any);
mediaRouter.get('/:id/variants/:variant', serveMediaVariant as any);
