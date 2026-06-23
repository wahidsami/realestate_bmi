/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisualPage, PageVersion } from '@bina/types';
import { apiClient } from '../api';
import type { IVisualPagesRepository } from './contracts';

const normalizeWidget = (widget: any) => widget;

const DEFAULT_VISUAL_PAGES: VisualPage[] = [
  {
    id: 'vp_home',
    slug: 'home',
    titleAr: 'الصفحة الرئيسية',
    titleEn: 'Homepage Layout',
    status: 'published',
    createdAt: new Date('2026-06-19').toISOString(),
    updatedAt: new Date('2026-06-19').toISOString(),
    sections: [
      {
        id: 'vsec_home_hero',
        nameAr: 'العنوان الترحيبي العريض',
        nameEn: 'Grand Welcome Banner',
        visible: true,
        backgroundColor: '#0F172A',
        paddingY: 'large',
        rows: [
          {
            id: 'vrow_home_1',
            columns: [
              {
                id: 'vcol_home_1',
                span: 12,
                widgets: [
                  normalizeWidget({
                    id: 'w_home_1',
                    type: 'heading',
                    settings: {
                      textAr: 'صناعة العهد الجديد من المعمار الفاخر بالمملكة',
                      textEn: 'Crafting the New Era of Prestige Architecture in Saudi Arabia',
                      align: 'center',
                      size: '3xl',
                      color: '#ffffff',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'vp_about',
    slug: 'about',
    titleAr: 'صفحة من نحن والمسيرة',
    titleEn: 'About Us Layout',
    status: 'published',
    createdAt: new Date('2026-06-19').toISOString(),
    updatedAt: new Date('2026-06-19').toISOString(),
    sections: [
      {
        id: 'vsec_about_top',
        nameAr: 'عن الشركة والقصة',
        nameEn: 'Corporate Roots and Heading',
        visible: true,
        backgroundColor: '#0F172A',
        paddingY: 'medium',
        rows: [
          {
            id: 'vrow_about_1',
            columns: [
              {
                id: 'vcol_about_1',
                span: 12,
                widgets: [
                  normalizeWidget({
                    id: 'w_about_1',
                    type: 'heading',
                    settings: {
                      textAr: 'أصل بناء وإدارة العقارية',
                      textEn: 'Tracing the Roots of BINA & EDARAH',
                      align: 'center',
                      size: '2xl',
                      color: '#ffffff',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'vp_contact',
    slug: 'contact',
    titleAr: 'صفحة اتصل بنا ومقر الشركة',
    titleEn: 'Contact Us Layout',
    status: 'published',
    createdAt: new Date('2026-06-19').toISOString(),
    updatedAt: new Date('2026-06-19').toISOString(),
    sections: [
      {
        id: 'vsec_contact_top',
        nameAr: 'العقول الترحيبية للاتصال',
        nameEn: 'Inquiries Welcome Segment',
        visible: true,
        backgroundColor: '#0F172A',
        paddingY: 'medium',
        rows: [
          {
            id: 'vrow_contact_1',
            columns: [
              {
                id: 'vcol_contact_1',
                span: 12,
                widgets: [
                  normalizeWidget({
                    id: 'w_contact_1',
                    type: 'heading',
                    settings: {
                      textAr: 'يسعدنا التواصل معكم لتقديم الخدمات النخبوية',
                      textEn: 'We Welcome Your High-End Inquiries',
                      align: 'center',
                      size: '2xl',
                      color: '#ffffff',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'vp_services',
    slug: 'services',
    titleAr: 'صفحة الخدمات والحلول المتكاملة',
    titleEn: 'Our Corporate Services',
    status: 'published',
    createdAt: new Date('2026-06-19').toISOString(),
    updatedAt: new Date('2026-06-19').toISOString(),
    sections: [
      {
        id: 'vsec_services_main',
        nameAr: 'لوحة استعراض الحلول العقارية',
        nameEn: 'Elite Services Overview',
        visible: true,
        backgroundColor: '#FCFCFC',
        paddingY: 'medium',
        rows: [
          {
            id: 'vrow_services_1',
            columns: [
              {
                id: 'vcol_services_1',
                span: 12,
                widgets: [
                  normalizeWidget({
                    id: 'w_services_1',
                    type: 'heading',
                    settings: {
                      textAr: 'خدماتنا الاستراتيجية وحلول الهندسة العقارية المقاومة للمستقبل',
                      textEn: 'Our Strategic Real Estate Construction & Operations Services',
                      align: 'center',
                      size: '2xl',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'vp_prop_tpl',
    slug: 'property-template',
    titleAr: 'نموذج صفحة تفاصيل العقار',
    titleEn: 'Property Details Template',
    status: 'published',
    createdAt: new Date('2026-06-19').toISOString(),
    updatedAt: new Date('2026-06-19').toISOString(),
    sections: [
      {
        id: 'vsec_ptpl_hero',
        nameAr: 'لوحة تعريف بالهيكل العقاري',
        nameEn: 'Prestige Asset Description Banner',
        visible: true,
        backgroundColor: '#0F172A',
        paddingY: 'medium',
        rows: [
          {
            id: 'vrow_ptpl_1',
            columns: [
              {
                id: 'vcol_ptpl_1',
                span: 12,
                widgets: [
                  normalizeWidget({
                    id: 'w_ptpl_1',
                    type: 'heading',
                    settings: {
                      textAr: '{{title}}',
                      textEn: '{{title}}',
                      align: 'center',
                      size: '3xl',
                      color: '#ffffff',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'vp_proj_tpl',
    slug: 'project-template',
    titleAr: 'نموذج صفحة تفاصيل المشروع',
    titleEn: 'Project Details Template',
    status: 'published',
    createdAt: new Date('2026-06-19').toISOString(),
    updatedAt: new Date('2026-06-19').toISOString(),
    sections: [
      {
        id: 'vsec_proj_tpl_banner',
        nameAr: 'العنوان الرئيسي للمشروع',
        nameEn: 'Flagship Dynamic Project Banner',
        visible: true,
        backgroundColor: '#0F172A',
        paddingY: 'medium',
        rows: [
          {
            id: 'vrow_pj_tpl_1',
            columns: [
              {
                id: 'vcol_pj_tpl_1',
                span: 12,
                widgets: [
                  normalizeWidget({
                    id: 'w_pj_tpl_1',
                    type: 'heading',
                    settings: {
                      textAr: 'طرح مجتمعي فاخر: {{title}}',
                      textEn: 'Prestigious Flagship Community: {{title}}',
                      align: 'center',
                      size: '3xl',
                      color: '#ffffff',
                    },
                  }),
                  normalizeWidget({
                    id: 'w_pj_tpl_2',
                    type: 'text',
                    settings: {
                      textAr: 'المطور: {{developer}} | الوحدات: {{units}} | الحالة: {{status}} | {{description}}',
                      textEn: 'Developer: {{developer}} | Units: {{units}} | Status: {{status}} | {{description}}',
                      align: 'center',
                      color: 'rgba(255,255,255,0.88)',
                    },
                  }),
                  normalizeWidget({
                    id: 'w_pj_tpl_3',
                    type: 'button',
                    settings: {
                      textAr: 'تواصل حول هذا المشروع',
                      textEn: 'Inquire About This Project',
                      buttonLink: '/contact',
                      align: 'center',
                      color: '#d4af37',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const normalizePage = (page: VisualPage): VisualPage => ({
  ...page,
  sections: Array.isArray(page.sections) ? page.sections : [],
});

const normalizeVersion = (version: PageVersion): PageVersion => ({
  ...version,
  data: normalizePage(version.data),
});

const unwrapList = (response: unknown): VisualPage[] => {
  if (!isRecord(response)) return [];
  if (isRecord(response.data) && Array.isArray(response.data.items)) return response.data.items as VisualPage[];
  if (Array.isArray(response.items)) return response.items as VisualPage[];
  return [];
};

const unwrapPage = (response: unknown): VisualPage | null => {
  if (!isRecord(response)) return null;
  if (isRecord(response.data) && isRecord(response.data.data)) return response.data.data as VisualPage;
  if (isRecord(response.data)) return response.data as VisualPage;
  if (isRecord(response.page)) return response.page as VisualPage;
  return null;
};

const unwrapVersionList = (response: unknown): PageVersion[] => {
  if (!isRecord(response)) return [];
  if (Array.isArray(response.data)) return response.data as PageVersion[];
  if (isRecord(response.data) && Array.isArray(response.data.items)) return response.data.items as PageVersion[];
  if (Array.isArray(response.items)) return response.items as PageVersion[];
  return [];
};

export class VisualPagesRepository implements IVisualPagesRepository {
  private subscribers: (() => void)[] = [];
  private cache: VisualPage[] = DEFAULT_VISUAL_PAGES.map(normalizePage);
  private versionsCache = new Map<string, PageVersion[]>();
  private defaultsSeeded = false;

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((subscriber) => subscriber !== cb);
    };
  }

  private notify(): void {
    for (const cb of this.subscribers) {
      try {
        cb();
      } catch (error) {
        console.error('Error notifying visual page subscribers:', error);
      }
    }
  }

  private upsertCache(page: VisualPage): void {
    const normalized = normalizePage(page);
    const index = this.cache.findIndex((item) => item.id === normalized.id || item.slug === normalized.slug);
    if (index >= 0) {
      this.cache[index] = normalized;
    } else {
      this.cache = [normalized, ...this.cache];
    }
  }

  private removeFromCache(id: string): void {
    this.cache = this.cache.filter((page) => page.id !== id);
    this.versionsCache.delete(id);
  }

  private async seedDefaults(): Promise<void> {
    if (!apiClient.enabled || this.defaultsSeeded) {
      return;
    }

    this.defaultsSeeded = true;
    for (const page of DEFAULT_VISUAL_PAGES) {
      try {
        await apiClient.post('/visual-pages', cloneJson(page));
      } catch {
        // Keep the local cache usable if seeding is temporarily unavailable.
      }
    }
  }

  public getPagesSync(): VisualPage[] {
    return this.cache.map(normalizePage);
  }

  public async getPages(): Promise<VisualPage[]> {
    if (!apiClient.enabled) {
      return this.getPagesSync();
    }

    try {
      if (import.meta.env?.DEV) {
        console.log('[VisualPagesRepository] Loading visual pages from API');
      }
      const response = await apiClient.get('/visual-pages');
      const items = unwrapList(response).map(normalizePage);

      if (items.length > 0) {
        this.cache = items;
        this.notify();
        return this.getPagesSync();
      }

      await this.seedDefaults();
      this.cache = DEFAULT_VISUAL_PAGES.map(normalizePage);
      this.notify();
      return this.getPagesSync();
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[VisualPagesRepository] Returning cached pages because API read failed', error);
      }
      return this.getPagesSync();
    }
  }

  public async getPageById(id: string): Promise<VisualPage | null> {
    const cached = this.cache.find((page) => page.id === id);
    if (cached) {
      return normalizePage(cached);
    }

    if (!apiClient.enabled) {
      return null;
    }

    try {
      const response = await apiClient.get(`/visual-pages/${id}`);
      const page = unwrapPage(response);
      if (!page) {
        return null;
      }
      this.upsertCache(page);
      return normalizePage(page);
    } catch {
      return null;
    }
  }

  public async savePage(page: VisualPage): Promise<void> {
    const normalized = normalizePage(page);

    if (!apiClient.enabled) {
      this.upsertCache(normalized);
      this.notify();
      return;
    }

    try {
      if (import.meta.env?.DEV) {
        console.log('[VisualPagesRepository] Saving page', {
          id: normalized.id,
          slug: normalized.slug,
          status: normalized.status,
        });
      }

      const existing = await this.getPageById(normalized.id);
      const response = existing
        ? await apiClient.put(`/visual-pages/${normalized.id}`, normalized)
        : await apiClient.post('/visual-pages', normalized);
      const saved = unwrapPage(response);
      if (saved) {
        this.upsertCache(saved);
        this.notify();
        return;
      }

      throw new Error('Visual page save did not return a page payload.');
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.error('[VisualPagesRepository] savePage failed', error);
      }
      throw error;
    }
  }

  public async deletePage(id: string): Promise<void> {
    if (apiClient.enabled) {
      try {
        await apiClient.delete(`/visual-pages/${id}`);
      } catch {
        // Keep UI responsive even if the backend is temporarily unavailable.
      }
    }

    this.removeFromCache(id);
    this.notify();
  }

  public async getVersions(pageId: string): Promise<PageVersion[]> {
    const cached = this.versionsCache.get(pageId);
    if (cached) {
      return cached.map(normalizeVersion);
    }

    if (!apiClient.enabled) {
      return [];
    }

    try {
      const response = await apiClient.get(`/visual-pages/${pageId}/versions`);
      const versions = unwrapVersionList(response).map(normalizeVersion);
      this.versionsCache.set(pageId, versions);
      return versions;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[VisualPagesRepository] getVersions failed, returning cached versions', error);
      }
      return (this.versionsCache.get(pageId) || []).map(normalizeVersion);
    }
  }

  public async restoreVersion(versionId: string): Promise<VisualPage | null> {
    let pageId: string | null = null;
    for (const [cachedPageId, versions] of this.versionsCache.entries()) {
      if (versions.some((version) => version.id === versionId)) {
        pageId = cachedPageId;
        break;
      }
    }

    if (!pageId) {
      return null;
    }

    if (!apiClient.enabled) {
      const versions = this.versionsCache.get(pageId) || [];
      const version = versions.find((item) => item.id === versionId);
      return version ? normalizePage(version.data) : null;
    }

    try {
      const response = await apiClient.post(`/visual-pages/${pageId}/versions/${versionId}/restore`);
      const page = unwrapPage(response);
      if (!page) {
        return null;
      }
      this.upsertCache(page);
      this.notify();
      this.versionsCache.delete(pageId);
      return normalizePage(page);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[VisualPagesRepository] restoreVersion failed, using cached version if available', error);
      }
      const versions = this.versionsCache.get(pageId) || [];
      const version = versions.find((item) => item.id === versionId);
      return version ? normalizePage(version.data) : null;
    }
  }
}
