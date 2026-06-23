/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PageContent } from '@bina/types';
import { apiClient } from '../api';
import { ApiClientError } from '../api/errors';
import type { IPageRepository } from './contracts';

const DEFAULT_PAGES: PageContent[] = [
  {
    id: 'page_home',
    slug: 'home',
    title: {
      ar: 'أصل الفخامة والريادة العقارية',
      en: 'The Essence of Premium Real Estate Leadership'
    },
    subtitle: {
      ar: 'مجموعتنا تصيغ آفاق الغد بخبرة وطنية راسخة لتقديم أسلوب حياة استثنائي.',
      en: 'Our enterprise designs tomorrow’s masterworks with robust national expertise, delivering an exceptional way of living.'
    },
    sections: [
      {
        id: 'home_sec_vision',
        title: {
          ar: 'الرؤية الوطنية الراسخة',
          en: 'Our Anchored National Vision'
        },
        body: {
          ar: 'نلتزم بريادة قطاع التطوير العقاري الفاخر بالمملكة بما يتماشى ودعم ركائز رؤية السعودية ٢٠٣٠ لتمكين جودة حياة فريدة.',
          en: 'We are committed to pioneering the luxury real estate development sector in the Kingdom, in alignment with Saudi Vision 2030 to enable premium quality of life.'
        }
      },
      {
        id: 'home_sec_values',
        title: {
          ar: 'قيم النخبة',
          en: 'Elite Enterprise Values'
        },
        body: {
          ar: 'الأمانة، الابتكار المعماري المبدع، الجودة الفائقة دون مساومة، والوفاء بالوعود لشركائنا وعملائنا.',
          en: 'Integrity, creative architectural innovation, uncompromised premium crafts, and loyalty to our partners and clients.'
        }
      }
    ]
  },
  {
    id: 'page_about',
    slug: 'about',
    title: {
      ar: 'أصل بناء وإدارة العقارية',
      en: 'Tracing the Roots of BINA & EDARAH'
    },
    subtitle: {
      ar: 'تراث محلي ممتد برؤية عصرية تصنع معايير العيش الفاخر.',
      en: 'An enduring local heritage shaped with modern masterworks defining luxury lifestyles.'
    },
    sections: [
      {
        id: 'about_corp_story',
        title: {
          ar: 'القصة والمسيرة',
          en: 'Corporate Journey'
        },
        body: {
          ar: 'تأسست شركة بناء وإدارة العقارية ككيان ريادي يهدف إلى تلبية الطلب المتزايد على المشاريع الكبرى والنخبوية في المملكة العربية السعودية. نجحنا على مدار السنوات في حيازة ثقة كبار المستثمرين والملاك عبر تقديم مشاريع عمرانية تميزت بالجودة المتكاملة، الرفاهية السكنية والإدارة التشغيلية المستدامة.',
          en: 'BINA & EDARAH was established as a pioneering luxury real estate giant to cater to the growing demand for elite developments across the Kingdom of Saudi Arabia. Over the decade, we have secured absolute investor trust by delivering prestigious urban landmarks defined by premium finishes, absolute home convenience, and sustainable management operations.'
        }
      },
      {
        id: 'about_ceo_letter',
        title: {
          ar: 'كلمة مجلس الإدارة',
          en: 'Board of Directors Message'
        },
        body: {
          ar: 'ننطلق من رؤية وطنية تؤمن بأن السكن ليس مجرد جدران، بل بيئة ملهمة تصنع الرفاهية والسعادة والريادة. نفخر بأن نكون جزءًا أصيلاً ومؤثرًا في التنمية الحضارية الكبرى لمدن مملكتنا الغالية.',
          en: 'We proceed from a national vision that spaces are not merely concrete structures, but inspiring ecosystems that foster absolute wellbeing and happiness. We are proudly leading the monumental architectural transformation of our beloved Kingdom.'
        }
      }
    ]
  },
  {
    id: 'page_contact',
    slug: 'contact',
    title: {
      ar: 'يسعدنا التواصل معكم',
      en: 'We Welcome Your High-End Inquiries'
    },
    subtitle: {
      ar: 'مستشارونا العقاريون في خدمتكم على مدار الساعة لتلبية كافة تطلعاتكم النخبوية.',
      en: 'Our elite property advisors are available around the clock to assist with your premier real estate aspirations.'
    },
    sections: [
      {
        id: 'contact_hq',
        title: {
          ar: 'الإدارة العامة ومقر الشركة الرئيسي',
          en: 'General Corporate HQ'
        },
        body: {
          ar: 'برج بناء العقاري، طريق الملك فهد، العليا، الرياض، المملكة العربية السعودية. نعمل من الأحد إلى الخميس، من الساعة ٩ صباحًا وحتى ٥ مساءً.',
          en: 'BINA Corporate Tower, King Fahd Road, Al Olaya, Riyadh, Kingdom of Saudi Arabia. Open Sunday to Thursday, 9:00 AM to 5:00 PM.'
        }
      }
    ]
  }
];

let defaultsSeeded = false;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizePage = (page: PageContent): PageContent => ({
  ...page,
  sections: Array.isArray(page.sections) ? page.sections : [],
  subtitle: page.subtitle || { ar: '', en: '' },
  title: page.title || { ar: '', en: '' },
});

const unwrapPageList = (response: unknown): PageContent[] => {
  if (!isRecord(response)) {
    return [];
  }

  if (isRecord(response.data) && Array.isArray(response.data.items)) {
    return response.data.items as PageContent[];
  }

  if (Array.isArray(response.items)) {
    return response.items as PageContent[];
  }

  return [];
};

const unwrapPage = (response: unknown): PageContent | null => {
  if (!isRecord(response)) {
    return null;
  }

  if (isRecord(response.data) && isRecord(response.data.data)) {
    return response.data.data as PageContent;
  }

  if (isRecord(response.data)) {
    return response.data as PageContent;
  }

  if (isRecord(response.page)) {
    return response.page as PageContent;
  }

  return null;
};

const seedDefaultPages = async () => {
  if (!apiClient.enabled || defaultsSeeded) {
    return;
  }

  defaultsSeeded = true;
  for (const page of DEFAULT_PAGES) {
    try {
      await apiClient.post('/pages', page);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[PageRepository] Failed to seed default page', page.slug, error);
      }
    }
  }
};

export class PageRepository implements IPageRepository {
  public async getPages(): Promise<PageContent[]> {
    if (!apiClient.enabled) {
      return [];
    }

    try {
      if (import.meta.env?.DEV) {
        console.log('[PageRepository] Loading pages from API');
      }
      const response = await apiClient.get('/pages');
      const items = unwrapPageList(response).map(normalizePage);
      if (items.length > 0) {
        return items;
      }

      await seedDefaultPages();
      const refreshed = await apiClient.get('/pages');
      return unwrapPageList(refreshed).map(normalizePage);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('[PageRepository] Returning empty page list because API read failed', error);
      }
      return [];
    }
  }

  public async getPageBySlug(slug: string): Promise<PageContent | null> {
    const pages = await this.getPages();
    const found = pages.find((page) => page.slug === slug);
    return found ? normalizePage(found) : null;
  }

  public async updatePage(id: string, page: Partial<PageContent>): Promise<PageContent | null> {
    if (!apiClient.enabled) {
      throw new ApiClientError('API mode is disabled');
    }

    const response = await apiClient.put(`/pages/${id}`, page);
    const updated = unwrapPage(response);
    return updated ? normalizePage(updated) : null;
  }

  public async createPage(page: Omit<PageContent, 'id'>): Promise<PageContent> {
    if (!apiClient.enabled) {
      throw new ApiClientError('API mode is disabled');
    }

    const response = await apiClient.post('/pages', page);
    const created = unwrapPage(response);
    if (!created) {
      throw new ApiClientError('Page creation failed');
    }
    return normalizePage(created);
  }

  public async deletePage(id: string): Promise<boolean> {
    if (!apiClient.enabled) {
      return false;
    }

    await apiClient.delete(`/pages/${id}`);
    return true;
  }
}
