import { create } from 'zustand';
import type { AuthSession, AuthState, AdminUser } from '@/types/auth';
import { clearAuthSession, isAuthSessionExpired, readAuthSession, writeAuthSession } from '@/auth/auth-storage';

interface AuthActions {
  setSession: (session: AuthSession | null) => void;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
  refreshFromStorage: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  session: readAuthSession(),
  hydrated: true,
  setSession: (session) => {
    if (session) {
      writeAuthSession(session);
    } else {
      clearAuthSession();
    }

    set({ session });
  },
  setAdmin: (admin) => {
    const current = get().session;
    if (!current) {
      return;
    }

    const nextSession = { ...current, admin };
    writeAuthSession(nextSession);
    set({ session: nextSession });
  },
  logout: () => {
    clearAuthSession();
    set({ session: null });
  },
  refreshFromStorage: () => {
    set({ session: readAuthSession(), hydrated: true });
  },
}));

export const selectAuthSession = (state: AuthState & AuthActions) => state.session;
export const selectIsAuthenticated = (state: AuthState & AuthActions) =>
  Boolean(state.session) && !isAuthSessionExpired(state.session);
export const selectAdminToken = (state: AuthState & AuthActions) => state.session?.adminToken ?? null;
export const selectAdminUser = (state: AuthState & AuthActions) => state.session?.admin ?? null;
