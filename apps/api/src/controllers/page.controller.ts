import type { RequestHandler } from 'express';
import { PageService } from '../services/page.service.js';
import { HttpError } from '../utils/httpError.js';
import { pageQuerySchema } from '../validators/page.validator.js';

const pageService = new PageService();

const resolvePageId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const listPages: RequestHandler = async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const result = await pageService.listPages(query);
    res.json({
      success: true,
      data: result,
      message: 'Pages loaded successfully',
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

export const getPageById: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolvePageId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }

    const page = await pageService.getPageById(pageId);
    res.json({
      success: true,
      data: page,
      message: 'Page loaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createPage: RequestHandler = async (req, res, next) => {
  try {
    console.log('Received page payload', req.body);
    const page = await pageService.createPage(req.body, req.auth?.id);
    res.status(201).json({
      success: true,
      data: page,
      message: 'Page created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePage: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolvePageId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }

    console.log('Received page payload', req.body);
    const page = await pageService.updatePage(pageId, req.body, req.auth?.id);
    res.json({
      success: true,
      data: page,
      message: 'Page updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deletePage: RequestHandler = async (req, res, next) => {
  try {
    const pageId = resolvePageId(req.params.id);
    if (!pageId) {
      throw new HttpError(400, 'Page id is required');
    }

    const page = await pageService.deletePage(pageId, req.auth?.id);
    res.json({
      success: true,
      data: page,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
