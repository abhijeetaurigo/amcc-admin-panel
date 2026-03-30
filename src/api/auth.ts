import { apiClient } from './client';
import type { AuthSession, LoginRequest, LoginResponse, AdminUser } from '@/types/auth';
import { parseSinglePayload, readDateIso, readString, isRecord } from '@/lib/parsers';

export async function loginAdmin(credentials: LoginRequest): Promise<AuthSession> {
  const response = await apiClient.post<LoginResponse>('/v1/admin/auth', credentials);
  return parseAuthSession(response.data);
}

export function parseAuthSession(payload: unknown): AuthSession {
  const data: Record<string, unknown> = isRecord(payload)
    ? (isRecord(payload.data) ? payload.data : payload)
    : {};
  const adminPayload = parseSinglePayload(data.admin, parseAdminUser) ?? parseAdminUser(data.admin);

  return {
    adminToken: readString(data.admin_token ?? data.access_token ?? data.token),
    expiresAt:
      readDateIso(data.expires_at ?? data.expiresAt) ??
      new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    admin: adminPayload,
  };
}

export function parseAdminUser(payload: unknown): AdminUser {
  const data = isRecord(payload) ? payload : {};
  return {
    email: readString(data.email),
    name: readString(data.name),
    role: readString(data.role, 'admin'),
    lastLoginAt: readDateIso(data.last_login_at ?? data.lastLoginAt),
  };
}
