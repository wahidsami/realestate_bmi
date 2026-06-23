import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import {
  createVisualPage,
  deleteVisualPage,
  getVisualPageById,
  listVisualPageVersions,
  listVisualPages,
  restoreVisualPageVersion,
  updateVisualPage,
} from '../controllers/visual-page.controller.js';
import { visualPageSchema } from '../validators/visual-pages.validator.js';

export const visualPagesRouter = Router();

visualPagesRouter.get('/', authenticate, authorize('pages.edit'), listVisualPages);
visualPagesRouter.get('/:id', authenticate, authorize('pages.edit'), getVisualPageById);
visualPagesRouter.post('/', authenticate, authorize('pages.create', 'pages.edit'), validateBody(visualPageSchema), createVisualPage);
visualPagesRouter.put('/:id', authenticate, authorize('pages.edit'), validateBody(visualPageSchema), updateVisualPage);
visualPagesRouter.delete('/:id', authenticate, authorize('pages.delete', 'pages.edit'), deleteVisualPage);
visualPagesRouter.get('/:id/versions', authenticate, authorize('pages.edit'), listVisualPageVersions);
visualPagesRouter.post('/:id/versions/:versionId/restore', authenticate, authorize('pages.edit'), restoreVisualPageVersion);
