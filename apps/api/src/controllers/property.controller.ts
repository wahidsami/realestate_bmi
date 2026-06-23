import type { RequestHandler } from 'express';
import { PropertyService } from '../services/property.service.js';
import { HttpError } from '../utils/httpError.js';
import { propertyQuerySchema } from '../validators/property.validator.js';

const propertyService = new PropertyService();

const resolvePropertyId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const listProperties: RequestHandler = async (req, res, next) => {
  try {
    const query = propertyQuerySchema.parse(req.query);
    const result = await propertyService.listProperties(query);
    res.json({
      success: true,
      data: result,
      message: 'Properties loaded successfully',
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

export const getPropertyById: RequestHandler = async (req, res, next) => {
  try {
    const propertyId = resolvePropertyId(req.params.id);
    if (!propertyId) {
      throw new HttpError(400, 'Property id is required');
    }
    const property = await propertyService.getPropertyById(propertyId);
    res.json({
      success: true,
      data: property,
      message: 'Property loaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createProperty: RequestHandler = async (req, res, next) => {
  try {
    console.log('[PropertyController] POST /api/properties req.body:', req.body);
    const property = await propertyService.createProperty(req.body, req.auth?.id);
    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty: RequestHandler = async (req, res, next) => {
  try {
    console.log('[PropertyController] PUT /api/properties/:id req.body:', req.body);
    const propertyId = resolvePropertyId(req.params.id);
    if (!propertyId) {
      throw new HttpError(400, 'Property id is required');
    }
    const property = await propertyService.updateProperty(propertyId, req.body, req.auth?.id);
    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty: RequestHandler = async (req, res, next) => {
  try {
    const propertyId = resolvePropertyId(req.params.id);
    if (!propertyId) {
      throw new HttpError(400, 'Property id is required');
    }
    const property = await propertyService.deleteProperty(propertyId, req.auth?.id);
    res.json({
      success: true,
      data: property,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
