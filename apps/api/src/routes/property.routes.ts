import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { createProperty, deleteProperty, getPropertyById, listProperties, updateProperty } from '../controllers/property.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { propertyCreateSchema, propertyUpdateSchema } from '../validators/property.validator.js';

export const propertyRouter = Router();

propertyRouter.get('/', listProperties);
propertyRouter.get('/:id', getPropertyById);
propertyRouter.post('/', authenticate, authorize('properties.create'), validateBody(propertyCreateSchema), createProperty);
propertyRouter.put('/:id', authenticate, authorize('properties.edit'), validateBody(propertyUpdateSchema), updateProperty);
propertyRouter.delete('/:id', authenticate, authorize('properties.delete'), deleteProperty);
