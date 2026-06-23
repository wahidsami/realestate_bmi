import { z } from 'zod';

export const builderAssetKindSchema = z.enum(['design_theme', 'reusable_component', 'section_template', 'page_template']);

export const builderAssetSchema = z.object({
  id: z.string().min(1).optional(),
  kind: builderAssetKindSchema,
  key: z.string().optional(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  data: z.unknown(),
}).passthrough();

export const builderAssetUpdateSchema = z.object({
  kind: builderAssetKindSchema.optional(),
  key: z.string().optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  data: z.unknown().optional(),
}).passthrough();

export const builderAssetQuerySchema = z.object({
  kind: builderAssetKindSchema.optional(),
});

export type BuilderAssetDTO = z.infer<typeof builderAssetSchema>;
export type BuilderAssetUpdateDTO = z.infer<typeof builderAssetUpdateSchema>;
