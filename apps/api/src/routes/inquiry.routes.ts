import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { createInquiry, deleteInquiry, listInquiries, updateInquiryStatus } from '../controllers/inquiry.controller.js';
import { inquiryCreateSchema, inquiryStatusUpdateSchema } from '../validators/inquiry.validator.js';

export const inquiryRouter = Router();

inquiryRouter.get('/', authenticate, authorize('crm.manage'), listInquiries);
inquiryRouter.post('/', validateBody(inquiryCreateSchema), createInquiry);
inquiryRouter.patch('/:id/status', authenticate, authorize('crm.manage'), validateBody(inquiryStatusUpdateSchema), updateInquiryStatus);
inquiryRouter.delete('/:id', authenticate, authorize('crm.manage'), deleteInquiry);
