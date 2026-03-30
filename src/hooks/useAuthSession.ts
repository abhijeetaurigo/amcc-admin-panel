import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { AdminRole } from '@/types/auth';
import { isAuthSessionExpired } from '@/auth/auth-storage';

export function useAuthSession() {
  return useAuthStore((state) => state.session);
}

export function useAuthToken() {
  return useAuthStore((state) => state.session?.adminToken ?? null);
}

export function useIsAuthenticated() {
  return useAuthStore((state) => Boolean(state.session) && !isAuthSessionExpired(state.session));
}

export function useHasRole(requiredRole?: AdminRole | AdminRole[]) {
  const session = useAuthStore((state) => state.session);

  return useMemo(() => {
    if (!session || isAuthSessionExpired(session)) {
      return false;
    }

    if (!requiredRole) {
      return true;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(session.admin.role);
  }, [requiredRole, session]);
}
