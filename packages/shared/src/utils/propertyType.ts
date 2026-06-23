import type { BilingualText } from '@bina/types';

export type PropertyPresetType = 'apartment' | 'villa' | 'office' | 'shop' | 'land';

export const PROPERTY_TYPE_PRESETS: Array<{
  key: PropertyPresetType;
  label: BilingualText;
  synonyms: string[];
}> = [
  {
    key: 'apartment',
    label: { ar: 'شقة', en: 'Apartment' },
    synonyms: ['apartment', 'flat', 'unit', 'شقة', 'سكنية', 'residential apartment'],
  },
  {
    key: 'villa',
    label: { ar: 'فيلا فاخرة', en: 'Luxury Villa' },
    synonyms: ['villa', 'فيلا', 'فيلا فاخرة', 'luxury villa'],
  },
  {
    key: 'office',
    label: { ar: 'مكتب تجاري', en: 'Commercial Office' },
    synonyms: ['office', 'مكتب', 'commercial office', 'business office'],
  },
  {
    key: 'shop',
    label: { ar: 'معرض تجاري', en: 'Retail Shop' },
    synonyms: ['shop', 'retail', 'store', 'محل', 'معرض', 'retail shop'],
  },
  {
    key: 'land',
    label: { ar: 'أرض عقارية', en: 'Real Estate Land' },
    synonyms: ['land', 'plot', 'أرض', 'أرض عقارية', 'real estate land'],
  },
];

export const PROPERTY_TYPE_PRESET_KEYS = PROPERTY_TYPE_PRESETS.map((preset) => preset.key) as PropertyPresetType[];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesSynonym = (normalizedValue: string, synonym: string) => {
  const normalizedSynonym = synonym.trim().toLowerCase();
  if (!normalizedSynonym) return false;
  if (normalizedValue === normalizedSynonym) return true;

  const isAsciiSynonym = /^[\x00-\x7F]+$/.test(normalizedSynonym);
  if (!isAsciiSynonym) {
    return normalizedValue.includes(normalizedSynonym);
  }

  const escaped = escapeRegExp(normalizedSynonym);
  const boundaryRegex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
  return boundaryRegex.test(normalizedValue);
};

export const getPropertyTypePreset = (value?: string | null): PropertyPresetType | null => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return null;

  const preset = PROPERTY_TYPE_PRESETS.find(({ synonyms }) =>
    synonyms.some((synonym) => matchesSynonym(normalized, synonym)),
  );
  return preset?.key || null;
};

export const getPropertyTypeLabel = (preset: PropertyPresetType): BilingualText =>
  PROPERTY_TYPE_PRESETS.find((item) => item.key === preset)?.label || PROPERTY_TYPE_PRESETS[0].label;

export const getPropertyTypeFromText = (type?: BilingualText | null): {
  preset: PropertyPresetType | 'custom';
  value: BilingualText;
} => {
  const ar = String(type?.ar || '').trim();
  const en = String(type?.en || '').trim();
  const preset = getPropertyTypePreset(en || ar);
  if (preset) {
    return {
      preset,
      value: getPropertyTypeLabel(preset),
    };
  }

  return {
    preset: 'custom',
    value: {
      ar,
      en,
    },
  };
};
