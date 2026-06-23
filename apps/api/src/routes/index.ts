import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { mediaRouter } from './media.routes.js';
import { builderAssetRouter } from './builder-asset.routes.js';
import { inquiryRouter } from './inquiry.routes.js';
import { pageRouter } from './page.routes.js';
import { visualPagesRouter } from './visual-pages.routes.js';
import { propertyRouter } from './property.routes.js';
import { projectRouter } from './project.routes.js';
import { settingsRouter } from './settings.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/builder-assets', builderAssetRouter);
apiRouter.use('/inquiries', inquiryRouter);
apiRouter.use('/pages', pageRouter);
apiRouter.use('/visual-pages', visualPagesRouter);
apiRouter.use('/properties', propertyRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/settings', settingsRouter);
