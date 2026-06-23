import { z } from 'zod';

const bilingualTextSchema = z
  .object({
    ar: z.string().default(''),
    en: z.string().default(''),
  })
  .strip();

const pageSectionSchema = z
  .object({
    id: z.string().min(1),
    title: bilingualTextSchema.optional(),
    body: bilingualTextSchema,
  })
  .strip();

export const pageQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  parentId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

const pageBaseSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
    title: bilingualTextSchema.optional(),
    subtitle: bilingualTextSchema.optional(),
    sections: z.array(pageSectionSchema).optional(),
    slugAr: z.string().optional(),
    slugEn: z.string().optional(),
    contentAr: z.string().optional(),
    contentEn: z.string().optional(),
    seoTitleAr: z.string().optional(),
    seoTitleEn: z.string().optional(),
    seoDescAr: z.string().optional(),
    seoDescEn: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    parentId: z.string().optional().nullable(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strip();

const createPageSchema = pageBaseSchema.superRefine((value, ctx) => {
  if (!value.slug) {
    ctx.addIssue({ code: 'custom', message: 'Page slug is required', path: ['slug'] });
  }
  if (!value.title) {
    ctx.addIssue({ code: 'custom', message: 'Page title is required', path: ['title'] });
  }
});

export const pageCreateSchema = createPageSchema;
export const pageUpdateSchema = pageBaseSchema;

export type PageCreateDTO = z.infer<typeof pageCreateSchema>;
export type PageUpdateDTO = z.infer<typeof pageUpdateSchema>;
