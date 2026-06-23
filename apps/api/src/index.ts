import { createServer } from './server.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createServer();

app.listen(env.PORT, () => {
  logger.info(`API server listening on port ${env.PORT}`);
});
