import { z } from 'zod';

export const inquiryStatusSchema = z.enum(['new', 'contacted', 'closed']);

export const inquiryCreateSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')).transform((value) => (value === '' ? undefined : value)),
  phone: z.string().min(1).optional().or(z.literal('')).transform((value) => (value === '' ? undefined : value)),
  message: z.string().min(1).optional(),
  messageAr: z.string().min(1).optional(),
  messageEn: z.string().min(1).optional(),
  propertyId: z.string().optional(),
  projectId: z.string().optional(),
  unitId: z.string().optional(),
  source: z.string().optional(),
  status: inquiryStatusSchema.optional(),
}).passthrough();

export const inquiryStatusUpdateSchema = z.object({
  status: inquiryStatusSchema,
});

export const inquiryQuerySchema = z.object({
  status: inquiryStatusSchema.optional(),
});

export type InquiryCreateDTO = z.infer<typeof inquiryCreateSchema>;
export type InquiryStatusUpdateDTO = z.infer<typeof inquiryStatusUpdateSchema>;
