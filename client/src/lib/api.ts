import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

/** Backend errors follow {status:'error', error:{message}} — surface that
 * message instead of Axios's generic "Request failed with status code N". */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(err)) {
    const message = (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

// Concurrent 401s must not each fire their own refresh request — share one
// in-flight promise so a page with five parallel queries only refreshes once.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<{ data: { accessToken: string } }>(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    const token = res.data.data.accessToken;
    useAuthStore.getState().setAccessToken(token);
    return token;
  } catch {
    useAuthStore.getState().clearAuth();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetryableConfig;

    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      refreshPromise ??= refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;

      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);
