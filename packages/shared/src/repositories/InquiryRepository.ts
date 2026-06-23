/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inquiry } from '@bina/types';
import { apiClient } from '../api';
import { ApiClientError } from '../api/errors';
import type { IInquiryRepository } from './contracts';

const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_1',
    fullName: 'سليمان بن عبد الرحمن الغامدي',
    email: 's.ghamdi@outlook.sa',
    phone: '0505121234',
    message: 'السلام عليكم ورحمة الله، أود الحصول على كتيب المواصفات الخاص بفيلا السمو السلمانية وهل تتوفر لديكم خيارات تمويل عقاري متوافقة مع الشريعة؟',
    propertyId: 'prop_w_villa',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq_2',
    fullName: 'الأميرة نوف آل سعود',
    email: 'nouf.office@royal.sa',
    phone: '0555981290',
    message: 'Excellent penthouse listing. I would love to arrange a private VIP tour of the Royal Emperor Penthouse and consult on matching custom fit-out options.',
    propertyId: 'prop_r_penthouse',
    status: 'contacted',
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeInquiry = (inquiry: Inquiry): Inquiry => ({
  ...inquiry,
  email: inquiry.email || '',
  phone: inquiry.phone || '',
  message: inquiry.message || '',
  propertyId: inquiry.propertyId || undefined,
  projectId: inquiry.projectId || undefined,
  status: inquiry.status || 'new',
});

const unwrapList = (response: unknown): Inquiry[] => {
  if (!isRecord(response)) return [];
  if (isRecord(response.data) && Array.isArray(response.data.items)) return response.data.items as Inquiry[];
  if (Array.isArray(response.items)) return response.items as Inquiry[];
  if (Array.isArray(response.data)) return response.data as Inquiry[];
  return [];
};

const unwrapInquiry = (response: unknown): Inquiry | null => {
  if (!isRecord(response)) return null;
  if (isRecord(response.data) && isRecord(response.data.data)) return response.data.data as Inquiry;
  if (isRecord(response.data)) return response.data as Inquiry;
  return null;
};

export class InquiryRepository implements IInquiryRepository {
  private cache: Inquiry[] = DEFAULT_INQUIRIES.map(normalizeInquiry);
  private defaultsSeeded = false;

  private upsertCache(inquiry: Inquiry): void {
    const normalized = normalizeInquiry(inquiry);
    const index = this.cache.findIndex((item) => item.id === normalized.id);
    if (index >= 0) {
      this.cache[index] = normalized;
    } else {
      this.cache = [normalized, ...this.cache];
    }
  }

  private removeFromCache(id: string): void {
    this.cache = this.cache.filter((item) => item.id !== id);
  }

  private async seedDefaults(): Promise<void> {
    if (!apiClient.enabled || this.defaultsSeeded) {
      return;
    }

    this.defaultsSeeded = true;
    for (const inquiry of DEFAULT_INQUIRIES) {
      try {
        await apiClient.post('/inquiries', {
          fullName: inquiry.fullName,
          email: inquiry.email,
          phone: inquiry.phone,
          message: inquiry.message,
          propertyId: inquiry.propertyId,
          status: inquiry.status,
        });
      } catch {
        // Keep fallback data usable if seeding temporarily fails.
      }
    }
  }

  public async getInquiries(): Promise<Inquiry[]> {
    if (!apiClient.enabled) {
      return this.cache.map(normalizeInquiry);
    }

    try {
      const response = await apiClient.get('/inquiries');
      const items = unwrapList(response).map(normalizeInquiry);
      if (items.length > 0) {
        this.cache = items;
        return this.cache.map(normalizeInquiry);
      }

      await this.seedDefaults();
      return this.cache.map(normalizeInquiry);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[InquiryRepository] Returning cached inquiries because API read failed', error);
      }
      return this.cache.map(normalizeInquiry);
    }
  }

  public async createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const payload = {
      fullName: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      propertyId: inquiry.propertyId,
      projectId: inquiry.projectId,
      status: inquiry.status,
    };

    if (!apiClient.enabled) {
      const created = normalizeInquiry({
        ...inquiry,
        id: `inq_${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      this.upsertCache(created);
      return created;
    }

    try {
      const response = await apiClient.post('/inquiries', payload);
      const created = unwrapInquiry(response);
      if (!created) {
        throw new ApiClientError('Inquiry creation failed');
      }
      this.upsertCache(created);
      return created;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[InquiryRepository] createInquiry failed', error);
      }
      throw error instanceof Error ? error : new ApiClientError('Inquiry creation failed');
    }
  }

  public async updateInquiryStatus(id: string, status: Inquiry['status']): Promise<Inquiry | null> {
    if (!apiClient.enabled) {
      const index = this.cache.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }
      this.cache[index].status = status;
      return normalizeInquiry(this.cache[index]);
    }

    try {
      const response = await apiClient.patch(`/inquiries/${id}/status`, { status });
      const updated = unwrapInquiry(response);
      if (!updated) {
        return null;
      }
      this.upsertCache(updated);
      return updated;
    } catch {
      const fallback = this.cache.find((item) => item.id === id) || null;
      if (fallback) {
        fallback.status = status;
        return normalizeInquiry(fallback);
      }
      return null;
    }
  }

  public async deleteInquiry(id: string): Promise<boolean> {
    if (!apiClient.enabled) {
      const before = this.cache.length;
      this.removeFromCache(id);
      return this.cache.length !== before;
    }

    try {
      await apiClient.delete(`/inquiries/${id}`);
      this.removeFromCache(id);
      return true;
    } catch {
      const before = this.cache.length;
      this.removeFromCache(id);
      return this.cache.length !== before;
    }
  }
}
