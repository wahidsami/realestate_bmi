import { z } from 'zod';

export const visualPageStatusSchema = z.enum(['draft', 'published']);

const jsonValueSchema = z.unknown();

export const visualPageSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  status: visualPageStatusSchema.default('draft'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  sections: z.array(jsonValueSchema).default([]),
}).passthrough();

export const visualPageQuerySchema = z.object({
  search: z.string().optional(),
  status: visualPageStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type VisualPageDTO = z.infer<typeof visualPageSchema>;
