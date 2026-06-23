import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { createBuilderAsset, deleteBuilderAsset, listBuilderAssets, updateBuilderAsset } from '../controllers/builder-asset.controller.js';
import { builderAssetSchema, builderAssetUpdateSchema } from '../validators/builder-asset.validator.js';

export const builderAssetRouter = Router();

builderAssetRouter.get('/', authenticate, authorize('pages.edit'), listBuilderAssets);
builderAssetRouter.post('/', authenticate, authorize('pages.edit'), validateBody(builderAssetSchema), createBuilderAsset);
builderAssetRouter.put('/:id', authenticate, authorize('pages.edit'), validateBody(builderAssetUpdateSchema), updateBuilderAsset);
builderAssetRouter.delete('/:id', authenticate, authorize('pages.edit'), deleteBuilderAsset);
