import { z } from 'zod';

const bilingualTextSchema = z
  .object({
    ar: z.string().default(''),
    en: z.string().default(''),
  })
  .strip();

const bilingualTextArraySchema = z.array(bilingualTextSchema).optional();

const nearbyPlaceSchema = z
  .object({
    name: bilingualTextSchema,
    type: z.string().default(''),
    distance: z.string().default(''),
  })
  .passthrough();

const propertyStatusSchema = z.enum(['available', 'reserved', 'sold', 'rented']).optional();
const saleOrRentSchema = z.enum(['sale', 'rent']).optional();

export const propertyQuerySchema = z.object({
  search: z.string().optional(),
  status: propertyStatusSchema.optional(),
  projectId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

const propertyBaseSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
    title: bilingualTextSchema.optional(),
    description: bilingualTextSchema.optional(),
    price: z.coerce.number().nonnegative().optional(),
    location: bilingualTextSchema.optional(),
    district: bilingualTextSchema.optional(),
    address: bilingualTextSchema.optional(),
    type: bilingualTextSchema.optional(),
    coordinates: z.string().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    bathrooms: z.coerce.number().int().nonnegative().optional(),
    livingRooms: z.coerce.number().int().nonnegative().optional(),
    areaSqm: z.coerce.number().nonnegative().optional(),
    balconies: z.coerce.number().int().nonnegative().optional(),
    parkingSpaces: z.coerce.number().int().nonnegative().optional(),
    floorNumber: z.coerce.number().int().optional(),
    propertyAge: z.coerce.number().int().nonnegative().optional(),
    unitNumber: z.string().optional(),
    unitCode: z.string().optional(),
    finishingType: bilingualTextSchema.optional(),
    ownershipType: bilingualTextSchema.optional(),
    developer: bilingualTextSchema.optional(),
    currency: z.string().optional(),
    googleMapsLink: z.string().optional(),
    saleOrRent: saleOrRentSchema,
    featured: z.coerce.boolean().optional(),
    listingDate: z.string().optional(),
    featuredImageId: z.string().optional(),
    galleryImageIds: z.array(z.string()).optional(),
    floorPlanMediaIds: z.array(z.string()).optional(),
    floorPlanImageId: z.string().optional(),
    documentMediaIds: z.array(z.string()).optional(),
    videoUploadId: z.string().optional(),
    projectId: z.string().optional(),
    categoryId: z.string().optional(),
    status: propertyStatusSchema,
    amenityParking: z.coerce.boolean().optional(),
    amenityCoveredParking: z.coerce.boolean().optional(),
    amenityPool: z.coerce.boolean().optional(),
    amenityPrivatePool: z.coerce.boolean().optional(),
    amenityGym: z.coerce.boolean().optional(),
    amenityElevator: z.coerce.boolean().optional(),
    amenitySecurity: z.coerce.boolean().optional(),
    amenityMosque: z.coerce.boolean().optional(),
    amenityChildrenArea: z.coerce.boolean().optional(),
    amenityGarden: z.coerce.boolean().optional(),
    amenityMaidRoom: z.coerce.boolean().optional(),
    amenityDriverRoom: z.coerce.boolean().optional(),
    amenitySmartHome: z.coerce.boolean().optional(),
    customAmenities: bilingualTextArraySchema,
    highlights: bilingualTextArraySchema,
    projectVideoUrl: z.string().optional(),
    virtualTourUrl: z.string().optional(),
    tour360Url: z.string().optional(),
    nearbyPlaces: z.array(nearbyPlaceSchema).optional(),
    seoKeywords: z.string().optional(),
    openGraphImageId: z.string().optional(),
    canonicalUrl: z.string().optional(),
    seoTitleAr: z.string().optional(),
    seoTitleEn: z.string().optional(),
    seoDescAr: z.string().optional(),
    seoDescEn: z.string().optional(),
    inquiryMobile: z.string().optional(),
    inquiryEmail: z.string().optional(),
    inquiryMessageDefault: z.string().optional(),
  })
  .strip();

export const propertyCreateSchema = propertyBaseSchema;
export const propertyUpdateSchema = propertyBaseSchema;

export type PropertyCreateDTO = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateDTO = z.infer<typeof propertyUpdateSchema>;
