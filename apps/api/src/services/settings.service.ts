import { SettingsRepository } from '../repositories/settings.repository.js';

const settingsRepository = new SettingsRepository();

const DEFAULT_SETTINGS = {
  id: 'current_settings',
  companyName: {
    ar: 'بناء وإدارة',
    en: 'BINA & EDARAH',
  },
  companyTagline: {
    ar: 'إعادة تعريف التطوير والاستثمار العقاري الفاخر في المملكة',
    en: 'Redefining luxury real estate development and investment in the Kingdom',
  },
  primaryColor: '#064E3B',
  secondaryColor: '#B45309',
  accentColor: '#1E4E42',
  contactEmail: 'info@binaedarah.com.sa',
  contactPhone: '+966 11 456 7890',
  address: {
    ar: 'طريق الملك فهد، العليا، الرياض، المملكة العربية السعودية',
    en: 'King Fahd Road, Al Olaya, Riyadh, Kingdom of Saudi Arabia',
  },
};

const normalizeSettings = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...(value as Record<string, unknown>),
    id: 'current_settings',
  };
};

export class SettingsService {
  public async getSettings() {
    const record = await settingsRepository.getCurrentSettings();
    return normalizeSettings(record?.value);
  }

  public async updateSettings(settings: Record<string, unknown>) {
    const current = await this.getSettings();
    const updated = normalizeSettings({
      ...current,
      ...settings,
      id: 'current_settings',
    });

    await settingsRepository.upsertCurrentSettings(updated);
    return updated;
  }
}
