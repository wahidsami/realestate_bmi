import type { RequestHandler } from 'express';
import { HttpError } from '../utils/httpError.js';
import { builderAssetQuerySchema, builderAssetSchema, builderAssetUpdateSchema } from '../validators/builder-asset.validator.js';
import { BuilderAssetService } from '../services/builder-asset.service.js';

const builderAssetService = new BuilderAssetService();

const resolveId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export const listBuilderAssets: RequestHandler = async (req, res, next) => {
  try {
    const query = builderAssetQuerySchema.parse(req.query);
    const items = await builderAssetService.listAssets(query);
    res.json({ success: true, data: items, message: 'Builder assets loaded successfully' });
  } catch (error) {
    next(error);
  }
};

export const createBuilderAsset: RequestHandler = async (req, res, next) => {
  try {
    const payload = builderAssetSchema.parse(req.body);
    const asset = await builderAssetService.createAsset(payload, req.auth?.id);
    res.status(201).json({ success: true, data: asset, message: 'Builder asset created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateBuilderAsset: RequestHandler = async (req, res, next) => {
  try {
    const id = resolveId(req.params.id);
    if (!id) throw new HttpError(400, 'Asset id is required');
    const payload = builderAssetUpdateSchema.parse(req.body);
    const asset = await builderAssetService.updateAsset(id, payload, req.auth?.id);
    res.json({ success: true, data: asset, message: 'Builder asset updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteBuilderAsset: RequestHandler = async (req, res, next) => {
  try {
    const id = resolveId(req.params.id);
    if (!id) throw new HttpError(400, 'Asset id is required');
    const asset = await builderAssetService.deleteAsset(id, req.auth?.id);
    res.json({ success: true, data: asset, message: 'Builder asset deleted successfully' });
  } catch (error) {
    next(error);
  }
};
