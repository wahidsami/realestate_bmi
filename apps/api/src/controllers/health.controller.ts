import type { RequestHandler } from 'express';

export const getHealth: RequestHandler = (_req, res) => {
  res.json({
    status: 'ok',
    service: 'bina-realestate-api',
    timestamp: new Date().toISOString(),
  });
};
