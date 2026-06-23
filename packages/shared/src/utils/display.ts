import type { BilingualText } from '@bina/types';

export const NA_TEXT = 'N/A';

export const displayTextOrNA = (value?: string | null) => {
  const text = String(value ?? '').trim();
  return text ? text : NA_TEXT;
};

export const displayNumberOrNA = (value?: number | null) => {
  return value === undefined || value === null || Number.isNaN(value) ? NA_TEXT : String(value);
};

export const displayCurrencyOrNA = (value?: number | null, locale: 'ar' | 'en' = 'en', currency = 'SAR') => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return NA_TEXT;
  }
  return `${value.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${currency}`;
};

export const displayBilingualOrNA = (value?: BilingualText | string | null, language: 'ar' | 'en' = 'en') => {
  if (!value) return NA_TEXT;
  if (typeof value === 'string') {
    return displayTextOrNA(value);
  }

  const primary = language === 'ar' ? value.ar : value.en;
  const secondary = language === 'ar' ? value.en : value.ar;
  return displayTextOrNA(primary || secondary);
};
