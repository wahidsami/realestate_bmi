type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const apiCache = {
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.value as T;
  },

  set<T>(key: string, value: T, ttlMs = 30_000) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  delete(key: string) {
    cache.delete(key);
  },

  clear() {
    cache.clear();
  },

  invalidate(prefix: string) {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  },
};
