import type { RequestHandler } from 'express';
import { HttpError } from '../utils/httpError.js';
import { visualPageQuerySchema, visualPageSchema } from '../validators/visual-pages.validator.js';
import { VisualPageService } from '../services/visual-page.service.js';

const visualPageService = new VisualPageService();

const resolveId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const listVisualPages: RequestHandler = async (req, res, next) => {
  try {
    const query = visualPageQuerySchema.parse(req.query);
    const result = await visualPageService.listPages(query);
    res.json({
      success: true,
      data: result,
      message: 'Visual pages loaded successfully',
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVisualPageById: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolveId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }
    const page = await visualPageService.getPageById(pageId);
    res.json({
      success: true,
      data: page,
      message: 'Visual page loaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createVisualPage: RequestHandler = async (req, res, next) => {
  try {
    console.log('Received visual page payload', req.body);
    const payload = visualPageSchema.parse(req.body);
    const page = await visualPageService.createPage(payload, req.auth?.id);
    res.status(201).json({
      success: true,
      data: page,
      message: 'Visual page created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisualPage: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolveId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }
    console.log('Received visual page payload', req.body);
    const payload = visualPageSchema.parse(req.body);
    const page = await visualPageService.updatePage(pageId, payload, req.auth?.id);
    res.json({
      success: true,
      data: page,
      message: 'Visual page updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVisualPage: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolveId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }
    const page = await visualPageService.deletePage(pageId, req.auth?.id);
    res.json({
      success: true,
      data: page,
      message: 'Visual page deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const listVisualPageVersions: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolveId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }
    const versions = await visualPageService.getVersions(pageId);
    res.json({
      success: true,
      data: versions,
      message: 'Visual page versions loaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const restoreVisualPageVersion: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolveId(req.params.id);
    const versionId = resolveId(req.params.versionId);
    if (!pageId || !versionId) {
      throw new HttpError(400, 'Page id and version id are required');
    }
    const page = await visualPageService.restoreVersion(pageId, versionId, req.auth?.id);
    res.json({
      success: true,
      data: page,
      message: 'Visual page version restored successfully',
    });
  } catch (error) {
    next(error);
  }
};
