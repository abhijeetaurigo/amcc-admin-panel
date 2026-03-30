export interface TenantSubscriptionInfo {
  tier: string;
  features: string[];
  maxUsers: number | null;
}

export interface Tenant {
  tenantUuid: string;
  domainName: string;
  buildUrl: string;
  createdAt: string | null;
  lastSeenAt: string | null;
  isActive: boolean;
  totalUsers: number;
  totalActiveSessions: number;
  subscriptionInfo: TenantSubscriptionInfo;
}

export interface TenantListResult {
  tenants: Tenant[];
  totalCount: number;
}

export interface TenantApiResponse {
  tenant_uuid?: string;
  tenantUuid?: string;
  domain_name?: string;
  domainName?: string;
  build_url?: string;
  buildUrl?: string;
  created_at?: string;
  createdAt?: string;
  last_seen_at?: string;
  lastSeenAt?: string;
  is_active?: boolean;
  isActive?: boolean;
  total_users?: number;
  totalUsers?: number;
  total_active_sessions?: number;
  totalActiveSessions?: number;
  subscription_info?: unknown;
  subscriptionInfo?: unknown;
}
