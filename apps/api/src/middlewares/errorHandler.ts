import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { HttpError } from '../utils/httpError.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof HttpError ? err.statusCode : err instanceof ZodError ? 400 : 500;

  logger.error('API error', {
    statusCode,
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message: err instanceof Error ? err.message : 'Internal server error',
    details: err instanceof HttpError ? err.details : err instanceof ZodError ? err.flatten() : undefined,
  });
};
