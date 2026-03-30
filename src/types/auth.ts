export type AdminRole = 'super_admin' | 'admin' | 'support' | 'viewer' | string;

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  lastLoginAt: string | null;
}

export interface AuthSession {
  adminToken: string;
  expiresAt: string;
  admin: AdminUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin_token?: string;
  token?: string;
  access_token?: string;
  expires_at?: string;
  expiresAt?: string;
  admin?: unknown;
}

export interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
}
