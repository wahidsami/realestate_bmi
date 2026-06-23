import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { createPage, deletePage, getPageById, listPages, updatePage } from '../controllers/page.controller.js';
import { pageCreateSchema, pageUpdateSchema } from '../validators/page.validator.js';

export const pageRouter = Router();

pageRouter.get('/', listPages);
pageRouter.get('/:id', getPageById);
pageRouter.post('/', authenticate, authorize('pages.create'), validateBody(pageCreateSchema), createPage);
pageRouter.put('/:id', authenticate, authorize('pages.edit'), validateBody(pageUpdateSchema), updatePage);
pageRouter.delete('/:id', authenticate, authorize('pages.delete'), deletePage);
