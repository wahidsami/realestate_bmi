import { z } from 'zod';

const bilingualTextSchema = z
  .object({
    ar: z.string().default(''),
    en: z.string().default(''),
  })
  .strip();

export const projectQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['available', 'under-construction', 'sold-out', 'draft']).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

const projectBaseSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
    name: bilingualTextSchema.optional(),
    description: bilingualTextSchema.optional(),
    location: bilingualTextSchema.optional(),
    city: bilingualTextSchema.optional(),
    district: bilingualTextSchema.optional(),
    address: bilingualTextSchema.optional(),
    completionDate: z.string().optional(),
    status: z.enum(['available', 'under-construction', 'sold-out', 'draft']).optional(),
    featured: z.coerce.boolean().optional(),
    coverImageId: z.string().optional(),
    galleryImageIds: z.array(z.string()).optional(),
    brochurePdfId: z.string().optional(),
    videoUploadId: z.string().optional(),
    googleMapsLink: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    amenityParking: z.coerce.boolean().optional(),
    amenitySecurity: z.coerce.boolean().optional(),
    amenityElevators: z.coerce.boolean().optional(),
    amenityMosque: z.coerce.boolean().optional(),
    amenityGym: z.coerce.boolean().optional(),
    amenityPool: z.coerce.boolean().optional(),
    amenityChildrenArea: z.coerce.boolean().optional(),
    customAmenities: z.array(bilingualTextSchema).optional(),
    seoTitleAr: z.string().optional(),
    seoTitleEn: z.string().optional(),
    seoDescAr: z.string().optional(),
    seoDescEn: z.string().optional(),
  })
  .strip();

const createProjectSchema = projectBaseSchema.superRefine((value, ctx) => {
  if (!value.name) {
    ctx.addIssue({ code: 'custom', message: 'Project name is required', path: ['name'] });
  }
  if (!value.description) {
    ctx.addIssue({ code: 'custom', message: 'Project description is required', path: ['description'] });
  }
});

export const projectCreateSchema = createProjectSchema;
export const projectUpdateSchema = projectBaseSchema;

export type ProjectCreateDTO = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateDTO = z.infer<typeof projectUpdateSchema>;
