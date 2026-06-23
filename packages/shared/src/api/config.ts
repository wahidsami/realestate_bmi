const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const ensureApiPath = (value: string) => {
  const normalized = normalizeBaseUrl(value);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

export const API_BASE_URL = ensureApiPath(import.meta.env?.VITE_API_URL || 'http://localhost:4000');

export const USE_API = (import.meta.env?.VITE_USE_API || 'true').toLowerCase() === 'true';
