import axios, {
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getApiBaseUrl } from '@/lib/env';
import { getAuthToken } from '@/auth/auth-storage';
import { useAuthStore } from '@/store/authStore';

type ApiRequestMeta = {
  requestId: string;
  startedAt: number;
};

type ApiRequestConfig = InternalAxiosRequestConfig & {
  apiMeta?: ApiRequestMeta;
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let interceptorsInstalled = false;

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `req_${Math.random().toString(36).slice(2, 10)}`;
}

function isSensitiveKey(key: string): boolean {
  return /token|password|secret|authorization|api[-_]?key/i.test(key);
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (accumulator, [key, item]) => {
        accumulator[key] = isSensitiveKey(key) ? '[REDACTED]' : sanitizeValue(item);
        return accumulator;
      },
      {},
    );
  }

  return value;
}

function getRequestLabel(config: ApiRequestConfig): string {
  const method = (config.method ?? 'GET').toUpperCase();
  return `${method} ${config.url ?? 'unknown-url'}`;
}

function logRequest(config: ApiRequestConfig): void {
  const meta = config.apiMeta ?? {
    requestId: generateRequestId(),
    startedAt: Date.now(),
  };

  config.apiMeta = meta;

  console.groupCollapsed(`[API] ${getRequestLabel(config)} ${meta.requestId}`);
  console.log('Request', {
    method: (config.method ?? 'GET').toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    params: sanitizeValue(config.params),
    data: sanitizeValue(config.data),
    headers: sanitizeValue({
      ...config.headers,
      Authorization: undefined,
    }),
    timeout: config.timeout,
  });
  console.groupEnd();
}

function logResponse(response: AxiosResponse): void {
  const config = response.config as ApiRequestConfig;
  const meta = config.apiMeta;
  const elapsedMs = meta ? Date.now() - meta.startedAt : undefined;

  console.groupCollapsed(
    `[API] ${getRequestLabel(config)}${meta ? ` ${meta.requestId}` : ''} completed${elapsedMs !== undefined ? ` in ${elapsedMs}ms` : ''}`,
  );
  console.log('Response', {
    status: response.status,
    statusText: response.statusText,
    data: sanitizeValue(response.data),
  });
  console.groupEnd();
}

function logError(error: unknown): void {
  if (!axios.isAxiosError(error)) {
    console.error('[API] Request failed', error);
    return;
  }

  const config = error.config as ApiRequestConfig | undefined;
  const meta = config?.apiMeta;
  const elapsedMs = meta ? Date.now() - meta.startedAt : undefined;

  console.groupCollapsed(
    `[API] ${config ? getRequestLabel(config) : 'REQUEST'}${meta ? ` ${meta.requestId}` : ''} failed${elapsedMs !== undefined ? ` in ${elapsedMs}ms` : ''}`,
  );
  console.error('Error', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: sanitizeValue(error.response?.data),
    params: sanitizeValue(config?.params),
    data: sanitizeValue(config?.data),
  });
  console.groupEnd();
}

function installInterceptors(): void {
  if (interceptorsInstalled) {
    return;
  }

  apiClient.interceptors.request.use((config) => {
    const nextConfig = config as ApiRequestConfig;
    nextConfig.apiMeta = {
      requestId: generateRequestId(),
      startedAt: Date.now(),
    };

    const token = getAuthToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      nextConfig.headers = headers;
    }

    logRequest(nextConfig);

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    (error) => {
      logError(error);
      if (error?.response?.status === 401) {
        useAuthStore.getState().logout();
      }

      return Promise.reject(error);
    },
  );

  interceptorsInstalled = true;
}

installInterceptors();
