import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const validateBody = (schema: ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new HttpError(400, 'Validation failed', result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
};
