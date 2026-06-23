import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

import { env } from './env.js';
import { buildTempUploadDirectory, ensureMediaStorageLayout, sanitizeFileName } from '../utils/mediaStorage.js';

ensureMediaStorageLayout();

const tempUploadPath = buildTempUploadDirectory();

if (!fs.existsSync(tempUploadPath)) {
  fs.mkdirSync(tempUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempUploadPath),
  filename: (_req, file, cb) => {
    const stamp = Date.now();
    const safeName = sanitizeFileName(file.originalname);
    cb(null, `${stamp}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE },
});

export const tempUploadDirectory = path.resolve(tempUploadPath);
