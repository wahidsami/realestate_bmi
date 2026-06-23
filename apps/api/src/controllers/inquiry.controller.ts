import type { RequestHandler } from 'express';
import { HttpError } from '../utils/httpError.js';
import { inquiryCreateSchema, inquiryQuerySchema, inquiryStatusUpdateSchema } from '../validators/inquiry.validator.js';
import { InquiryService } from '../services/inquiry.service.js';

const inquiryService = new InquiryService();

const resolveId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const listInquiries: RequestHandler = async (req, res, next) => {
  try {
    inquiryQuerySchema.parse(req.query);
    const items = await inquiryService.listInquiries();
    res.json({
      success: true,
      data: items,
      message: 'Inquiries loaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createInquiry: RequestHandler = async (req, res, next) => {
  try {
    const payload = inquiryCreateSchema.parse(req.body);
    const inquiry = await inquiryService.createInquiry(payload, req.auth?.id);
    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus: RequestHandler = async (req, res, next) => {
  try {
    const id = resolveId(req.params.id);
    if (!id) {
      throw new HttpError(400, 'Inquiry id is required');
    }
    const payload = inquiryStatusUpdateSchema.parse(req.body);
    const inquiry = await inquiryService.updateStatus(id, payload, req.auth?.id);
    res.json({
      success: true,
      data: inquiry,
      message: 'Inquiry status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry: RequestHandler = async (req, res, next) => {
  try {
    const id = resolveId(req.params.id);
    if (!id) {
      throw new HttpError(400, 'Inquiry id is required');
    }
    const inquiry = await inquiryService.deleteInquiry(id, req.auth?.id);
    res.json({
      success: true,
      data: inquiry,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
