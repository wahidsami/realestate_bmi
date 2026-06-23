import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { requestLoggerStream, logger } from './utils/logger.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';
import { healthRouter } from './routes/health.routes.js';

export const createServer = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }) as any,
  );
  app.use(cors({
    origin: [...env.CLIENT_ORIGINS],
    credentials: true,
  }) as any);
  app.use(cookieParser() as any);
  app.use(express.json({ limit: '2mb' }) as any);
  app.use(express.urlencoded({ extended: true }) as any);
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: requestLoggerStream }) as any);
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' || req.originalUrl === '/health',
  }) as any);

  app.use('/health', healthRouter);
  app.use('/api', apiRouter);

  // Root route for friendly message when visiting the API domain directly
  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'API is running' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  (app as any).on('error', (err: unknown) => {
    logger.error('Express app error', { err });
  });

  return app;
};
