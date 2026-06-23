import type { ZodTypeAny } from 'zod';

export const schemaByMethod = <T extends Record<string, ZodTypeAny>>(schemas: T) => schemas;
