import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, USE_API } from './config';
import { ApiClientError } from './errors';
import { apiCache } from './cache';

type AuthState = {
  accessToken: string | null;
  refreshInFlight: Promise<string | null> | null;
};

const authState: AuthState = {
  accessToken: null,
  refreshInFlight: null,
};

const emitLogoutEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bina:auth:logout'));
  }
};

const hasRefreshHintCookie = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie.includes('bmi_admin_session_hint=1');
};

const logApi = (level: 'debug' | 'warn' | 'error', message: string, meta: Record<string, unknown>) => {
  if (typeof console === 'undefined') {
    return;
  }

  const payload = { ...meta };
  if (import.meta.env?.DEV) {
    console[level](`[API ${level.toUpperCase()}] ${message}`, payload);
  }
};

const getRequestInfo = (config?: AxiosRequestConfig) => {
  const method = (config?.method || 'GET').toUpperCase();
  const url = config?.url || '';
  const absoluteUrl = url
    ? (config?.baseURL ? new URL(url, config.baseURL).toString() : new URL(url, API_BASE_URL).toString())
    : API_BASE_URL;
  return { method, url, absoluteUrl };
};

const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const requestInfo = getRequestInfo(config);
    logApi('debug', 'Request', requestInfo);
    if (authState.accessToken) {
      const headers = config.headers as any;
      if (typeof headers?.set === 'function') {
        headers.set('Authorization', `Bearer ${authState.accessToken}`);
      } else {
        headers.Authorization = `Bearer ${authState.accessToken}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      logApi('debug', 'Response', {
        method: response.config.method?.toUpperCase() || 'GET',
        url: response.config.url || '',
        status: response.status,
      });
      return response;
    },
    async (error: AxiosError) => {
      const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
      if (!original) {
        throw normalizeAxiosError(error);
      }

      const isUnauthorized = error.response?.status === 401;
      const isRefreshRequest = typeof original.url === 'string' && original.url.includes('/auth/refresh');

      if (USE_API && isUnauthorized && !original._retry && !isRefreshRequest && (authState.accessToken || hasRefreshHintCookie())) {
        original._retry = true;
        const refreshed = await refreshAccessToken(client);
        if (refreshed) {
          const headers = original.headers as any;
          if (typeof headers?.set === 'function') {
            headers.set('Authorization', `Bearer ${refreshed}`);
          } else {
            headers.Authorization = `Bearer ${refreshed}`;
          }
          return client.request(original);
        }
      }

      const requestInfo = getRequestInfo(original);
      const status = error.response?.status ?? 0;
      const isNetworkFailure = !error.response;
      const relativeUrl = requestInfo.url || requestInfo.absoluteUrl;
      if (import.meta.env?.DEV) {
        console.warn(`[API ERROR] ${requestInfo.method} ${relativeUrl}`);
        console.warn(status ? `Status: ${status}` : 'Connection refused or backend unavailable.');
      }
      logApi(isNetworkFailure ? 'warn' : 'error', 'Failed request', {
        method: requestInfo.method,
        url: requestInfo.absoluteUrl,
        status,
        message: error.message,
      });

      throw normalizeAxiosError(error);
    },
  );

  return client;
};

const refreshAccessToken = async (client: AxiosInstance): Promise<string | null> => {
  if (authState.refreshInFlight) {
    return authState.refreshInFlight;
  }

  authState.refreshInFlight = client
    .post('/auth/refresh', {}, { withCredentials: true })
    .then((response) => {
      const accessToken = response.data?.accessToken || null;
      if (accessToken) {
        authState.accessToken = accessToken;
      }
      return accessToken;
    })
    .catch(() => {
      authState.accessToken = null;
      apiCache.clear();
      emitLogoutEvent();
      return null;
    })
    .finally(() => {
      authState.refreshInFlight = null;
    });

  return authState.refreshInFlight;
};

const normalizeAxiosError = (error: AxiosError) => {
  const payload = error.response?.data as { message?: string; error?: string; details?: unknown } | undefined;
  const message = payload?.message || payload?.error || (!error.response ? 'Connection refused or backend unavailable.' : error.message) || 'Request failed';
  const requestInfo = getRequestInfo(error.config);
  return new ApiClientError(message, {
    status: error.response?.status,
    details: {
      endpoint: requestInfo.absoluteUrl,
      method: requestInfo.method,
      status: error.response?.status ?? 0,
      response: payload?.details ?? payload,
    },
  });
};

const httpClient = createHttpClient();

export const apiClient = {
  enabled: USE_API,

  hasAccessToken() {
    return authState.accessToken !== null;
  },

  setAccessToken(token: string | null) {
    authState.accessToken = token;
  },

  clearAuth() {
    authState.accessToken = null;
    apiCache.clear();
    emitLogoutEvent();
  },

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    if (!USE_API) {
      throw new ApiClientError('API mode is disabled');
    }

    try {
      const response = await httpClient.request<T>(config);
      return response.data;
    } catch (error) {
      const requestInfo = getRequestInfo(config);
      logApi('error', 'Request failed', {
        method: requestInfo.method,
        url: requestInfo.absoluteUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  },

  getAbsoluteUrl(path: string) {
    return new URL(path, API_BASE_URL).toString();
  },

  cache: apiCache,
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error).message;
  }
  return 'Request failed';
};
