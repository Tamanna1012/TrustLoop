import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { refreshRequest, meRequest } from '@/lib/auth';

/**
 * The access token lives only in memory (see D5 — never localStorage), so a
 * page reload loses it. This silently exchanges the httpOnly refresh cookie
 * for a new one on first load, before any protected route decides whether
 * to redirect to /login.
 */
export function useAuthBootstrap(): void {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  useEffect(() => {
    if (isBootstrapped) return;

    let cancelled = false;
    (async () => {
      try {
        const accessToken = await refreshRequest();
        const user = await meRequest();
        if (!cancelled) setAuth(user, accessToken);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setBootstrapped();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isBootstrapped, setAuth, clearAuth, setBootstrapped]);
}
