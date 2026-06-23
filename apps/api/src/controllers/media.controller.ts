import type { NextFunction, Request, Response, RequestHandler } from 'express';
import archiver from 'archiver';
import fs from 'node:fs';
import { MediaService } from '../services/media.service.js';
import { HttpError } from '../utils/httpError.js';
import { mediaBulkDownloadSchema, mediaBulkDeleteSchema, mediaDuplicateSchema, mediaFileQuerySchema, mediaFolderSchema, mediaListQuerySchema, mediaMoveSchema, mediaRestoreSchema, mediaUpdateSchema, mediaUploadSchema } from '../validators/media.validator.js';

const mediaService = new MediaService();

const resolveMediaId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parseFiles = (req: any): Express.Multer.File[] => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  return [];
};

export const listMedia: RequestHandler = async (req, res, next) => {
  try {
    const query = mediaListQuerySchema.parse(req.query);
    const result = await mediaService.listMedia(query);
    res.json({
      success: true,
      items: result.items,
      total: result.total,
      page: query.page,
      limit: query.limit,
    });
  } catch (error) {
    next(error);
  }
};

export const listPublicMedia: RequestHandler = async (req, res, next) => {
  try {
    const query = mediaListQuerySchema.parse({
      ...req.query,
      isPublic: true,
    });
    const result = await mediaService.listMedia(query);
    res.json({
      success: true,
      items: result.items,
      total: result.total,
      page: query.page,
      limit: query.limit,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedia: RequestHandler = async (req, res, next) => {
  try {
    const mediaId = resolveMediaId(req.params.id);
    if (!mediaId) {
      throw new HttpError(400, 'Media id is required');
    }
    const media = await mediaService.getMediaById(mediaId, true);
    res.json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const createFolder: RequestHandler = async (req, res, next) => {
  try {
    const body = mediaFolderSchema.parse(req.body);
    const folder = await mediaService.createFolder({
      name: body.name,
      parentId: body.parentId,
      userId: req.auth?.id,
    });
    res.status(201).json({ success: true, folder });
  } catch (error) {
    next(error);
  }
};

export const listFolders: RequestHandler = async (_req, res, next) => {
  try {
    const folders = await mediaService.listFolders();
    res.json({ success: true, folders });
  } catch (error) {
    next(error);
  }
};

export const uploadSingle: RequestHandler = async (req, res, next) => {
  try {
    const body = mediaUploadSchema.parse(req.body);
    const files = parseFiles(req);
    const media = await mediaService.uploadMedia(files, body, req.auth?.id);
    res.status(201).json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const uploadMultiple: RequestHandler = async (req, res, next) => {
  try {
    const body = mediaUploadSchema.parse(req.body);
    const files = parseFiles(req);
    const media = await mediaService.uploadMedia(files, body, req.auth?.id);
    res.status(201).json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const updateMedia: RequestHandler = async (req, res, next) => {
  try {
    const payload = mediaUpdateSchema.parse(req.body);
    const mediaId = resolveMediaId(req.params.id);
    if (!mediaId) {
      throw new HttpError(400, 'Media id is required');
    }
    const media = await mediaService.updateMedia(mediaId, payload, req.auth?.id);
    res.json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia: RequestHandler = async (req, res, next) => {
  try {
    const mediaId = resolveMediaId(req.params.id);
    if (!mediaId) {
      throw new HttpError(400, 'Media id is required');
    }
    const media = await mediaService.softDeleteMedia(mediaId, req.auth?.id);
    res.json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const restoreMedia: RequestHandler = async (req, res, next) => {
  try {
    const payload = mediaRestoreSchema.parse(req.body);
    const targetId = payload.id || payload.ids?.[0];
    if (!targetId) {
      throw new HttpError(400, 'Media id is required');
    }
    const media = await mediaService.restoreMedia(targetId, req.auth?.id);
    res.json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const moveMedia: RequestHandler = async (req, res, next) => {
  try {
    const payload = mediaMoveSchema.parse(req.body);
    const result = await mediaService.moveMedia(payload.ids, payload.folderId, payload.folder, req.auth?.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const duplicateMedia: RequestHandler = async (req, res, next) => {
  try {
    const payload = mediaDuplicateSchema.parse(req.body);
    const media = await mediaService.duplicateMedia(payload.id, payload.folderId, payload.folder, req.auth?.id);
    res.status(201).json({ success: true, media });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteMedia: RequestHandler = async (req, res, next) => {
  try {
    const payload = mediaBulkDeleteSchema.parse(req.body);
    const result = await mediaService.bulkDeleteMedia(payload.ids, req.auth?.id);
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

const streamMedia = async (req: Request, res: Response, next: NextFunction, asDownload: boolean) => {
  try {
    const query = mediaFileQuerySchema.parse(req.query);
    const variant = req.params.variant ? mediaFileQuerySchema.shape.variant.parse(req.params.variant) : query.variant;
    const mediaId = resolveMediaId(req.params.id);
    if (!mediaId) {
      throw new HttpError(400, 'Media id is required');
    }
    const { media, filePath, mimeType, downloadName } = await mediaService.resolveMediaFile(mediaId, req.auth?.id, variant);
    await mediaService.logDownload(media.id, req.auth?.id);
    if (asDownload) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName.replace(/"/g, '')}"`);
    } else {
      res.type(mimeType);
    }
    const stream = fs.createReadStream(filePath);
    stream.on('error', next);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const serveMediaFile: RequestHandler = async (req, res, next) => {
  await streamMedia(req, res, next, false);
};

export const serveMediaVariant: RequestHandler = async (req, res, next) => {
  await streamMedia(req, res, next, false);
};

export const downloadMedia: RequestHandler = async (req, res, next) => {
  await streamMedia(req, res, next, true);
};

export const bulkDownloadMedia: RequestHandler = async (req, res, next) => {
  try {
    const payload = mediaBulkDownloadSchema.parse(req.body);
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`media-${Date.now()}.zip`);
    archive.on('error', (error) => next(error));
    archive.pipe(res);

    for (const id of payload.ids) {
      const { media, filePath } = await mediaService.resolveMediaFile(id, req.auth?.id);
      archive.file(filePath, { name: media.originalName });
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};
