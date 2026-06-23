import { Writable } from 'node:stream';
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [new transports.Console()],
});

export const requestLoggerStream = new Writable({
  write(chunk, _encoding, callback) {
    logger.info(chunk.toString().trim());
    callback();
  },
});
