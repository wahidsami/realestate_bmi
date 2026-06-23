import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3001'),
  VITE_API_URL: z.string().url().default('http://localhost:4000'),
  UPLOAD_PATH: z.string().default('uploads'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),
  ADMIN_COOKIE_NAME: z.string().default('bmi_admin_session'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  MAX_UPLOAD_SIZE: z.coerce.number().int().positive().default(524_288_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

const data = parsed.data;

export const env = {
  ...data,
  DATABASE_URL: `postgresql://${encodeURIComponent(data.DB_USER)}:${encodeURIComponent(data.DB_PASSWORD)}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}`,
  CLIENT_ORIGINS: [data.WEB_URL, data.ADMIN_URL],
  PORT: data.API_PORT,
  UPLOAD_DIR: data.UPLOAD_PATH,
  JWT_ACCESS_EXPIRES_IN: data.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: data.JWT_REFRESH_EXPIRES_IN,
} as const;
