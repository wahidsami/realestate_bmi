/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WebsiteSettings } from '@bina/types';
import { apiClient } from '../api';
import type { ISettingsRepository } from './contracts';

const DEFAULT_SETTINGS: WebsiteSettings = {
  id: 'current_settings',
  companyName: {
    ar: 'بناء وإدارة',
    en: 'BINA & EDARAH'
  },
  companyTagline: {
    ar: 'إعادة تعريف التطوير والاستثمار العقاري الفاخر في المملكة',
    en: 'Redefining luxury real estate development and investment in the Kingdom'
  },
  primaryColor: '#064E3B',   // Deep Corporate Emerald
  secondaryColor: '#B45309', // Timeless Gold/Amber
  accentColor: '#1E4E42',    // Accent Teal
  contactEmail: 'info@binaedarah.com.sa',
  contactPhone: '+966 11 456 7890',
  address: {
    ar: 'طريق الملك فهد، العليا، الرياض، المملكة العربية السعودية',
    en: 'King Fahd Road, Al Olaya, Riyadh, Kingdom of Saudi Arabia'
  }
};

export class SettingsRepository implements ISettingsRepository {
  /**
   * Retrieves the current website configuration.
   * Readied for simple SQL migration query (SELECT * FROM settings WHERE id = 'current_settings' LIMIT 1)
   */
  public async getSettings(): Promise<WebsiteSettings> {
    if (apiClient.enabled) {
      try {
        const response = await apiClient.get<{ settings: WebsiteSettings }>('/settings');
        if (response.settings) {
          apiClient.cache.set('settings:current', response.settings, 30_000);
          return response.settings;
        }
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[SettingsRepository] Falling back to default settings because API read failed', error);
        }
      }
    }

    return DEFAULT_SETTINGS;
  }

  /**
   * Updates current website configuration.
   * Readied for SQL migration statement (UPDATE settings SET ...)
   */
  public async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    if (apiClient.enabled) {
      try {
        const response = await apiClient.patch<{ settings: WebsiteSettings }>('/settings', settings);
        if (response.settings) {
          apiClient.cache.set('settings:current', response.settings, 30_000);
          return response.settings;
        }
      } catch (error) {
        throw error;
      }
    }

    return { ...DEFAULT_SETTINGS, ...settings };
  }
}
