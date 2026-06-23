export type BrowserStorageKind = 'local' | 'session';

const memoryStorage = new Map<string, string>();

const makeKey = (kind: BrowserStorageKind, key: string) => `${kind}:${key}`;

const readMemoryStorageItem = (kind: BrowserStorageKind, key: string): string | null => {
  return memoryStorage.get(makeKey(kind, key)) ?? null;
};

const writeMemoryStorageItem = (kind: BrowserStorageKind, key: string, value: string): void => {
  memoryStorage.set(makeKey(kind, key), value);
};

const removeMemoryStorageItem = (kind: BrowserStorageKind, key: string): void => {
  memoryStorage.delete(makeKey(kind, key));
};

export const readStorageItem = (kind: BrowserStorageKind, key: string): string | null => {
  return readMemoryStorageItem(kind, key);
};

export const writeStorageItem = (kind: BrowserStorageKind, key: string, value: string): void => {
  writeMemoryStorageItem(kind, key, value);
};

export const removeStorageItem = (kind: BrowserStorageKind, key: string): void => {
  removeMemoryStorageItem(kind, key);
};

export const readJsonStorage = <T>(kind: BrowserStorageKind, key: string, fallback: T): T => {
  const raw = readStorageItem(kind, key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeJsonStorage = <T>(kind: BrowserStorageKind, key: string, value: T): void => {
  writeStorageItem(kind, key, JSON.stringify(value));
};
