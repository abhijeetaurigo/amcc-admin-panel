import type { AuthSession } from '@/types/auth';
import { readStoredJson, removeStoredValue, writeStoredJson } from '@/lib/storage';

const AUTH_SESSION_KEY = 'amcc.admin.session';

export function isAuthSessionExpired(session: AuthSession | null): boolean {
  if (!session) {
    return true;
  }

  const expiresAt = Date.parse(session.expiresAt);
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return expiresAt <= Date.now();
}

export function readAuthSession(): AuthSession | null {
  const session = readStoredJson<AuthSession>(AUTH_SESSION_KEY);
  if (!session || isAuthSessionExpired(session)) {
    clearAuthSession();
    return null;
  }

  return session;
}

export function writeAuthSession(session: AuthSession): void {
  writeStoredJson(AUTH_SESSION_KEY, session);
}

export function clearAuthSession(): void {
  removeStoredValue(AUTH_SESSION_KEY);
}

export function getAuthToken(): string | null {
  return readAuthSession()?.adminToken ?? null;
}
