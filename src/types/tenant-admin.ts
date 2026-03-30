export type SortDirection = 'asc' | 'desc';

export type TenantUserSortField =
  | 'created_at'
  | 'last_seen_at'
  | 'user_name'
  | 'first_name'
  | 'last_name'
  | 'total_auth_count';

export type TenantSessionSortField = 'created_at' | 'last_activity' | 'expires_at' | 'platform' | 'app_version';

export interface TenantCursorPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
  totalReturned: number;
}

export interface TenantPaginationHelp {
  cursorUsage: string | null;
  limitRange: string | null;
  searchFields: string[];
}

export interface TenantQueryInfo {
  tenantUuid: string;
  searchTerm: string | null;
  sortField: string | null;
  sortDirection: SortDirection | null;
  filtersApplied: string[];
}

export interface TenantUsersMetadata {
  tenantUuid: string;
  requestTimestamp: string | null;
  adminEmail: string | null;
  availableFilters: string[];
  availableSortFields: string[];
  paginationHelp: TenantPaginationHelp | null;
}

export interface TenantSessionsMetadata extends TenantUsersMetadata {
  sessionActions: TenantSessionActions | null;
}

export interface TenantSessionActions {
  revokeSession: string | null;
}

export interface TenantUser {
  userUuid: string;
  tenantUuid: string;
  tenantUserId: string;
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  isAdUser: boolean;
  roles: string[];
  isTenantCreator: boolean;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  isActive: boolean;
  accountLocked: boolean;
  dataSource: string | null;
  totalAuthCount: number;
  activeSessionsCount: number;
  lastPlatform: string | null;
  lastAppVersion: string | null;
  preferences: Record<string, unknown> | null;
}

export interface TenantSessionDeviceInfo {
  deviceId: string | null;
  osVersion: string | null;
  appVersion: string | null;
  platform: string | null;
}

export interface TenantSessionUserInfo {
  userName: string;
  firstName: string;
  lastName: string;
}

export interface TenantSession {
  sessionUuid: string;
  userUuid: string;
  tenantUuid: string;
  platform: string;
  appVersion: string;
  deviceInfo: TenantSessionDeviceInfo | null;
  createdAt: string | null;
  lastActivity: string | null;
  expiresAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  timeUntilExpiry: number;
  tenantTokenStatus: string | null;
  tenantTokenExpiresAt: string | null;
  tenantTokenLastUsed: string | null;
  tenantTokenRefreshCount: number;
  revokedAt: string | null;
  revokedReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  authMethod: string;
  ttl: number | null;
  refreshCount: number;
  apiCallsCount: number;
  tenantApiCallsCount: number;
  userInfo: TenantSessionUserInfo | null;
}

export interface TenantUsersListResult {
  items: TenantUser[];
  pagination: TenantCursorPagination;
  queryInfo: TenantQueryInfo | null;
  metadata: TenantUsersMetadata | null;
}

export interface TenantSessionsListResult {
  items: TenantSession[];
  pagination: TenantCursorPagination;
  queryInfo: TenantQueryInfo | null;
  metadata: TenantSessionsMetadata | null;
}

export interface TenantUsersQueryParams {
  cursor?: string;
  limit?: number;
  search?: string;
  sortField?: TenantUserSortField;
  sortDirection?: SortDirection;
  isActive?: boolean;
  isAdUser?: boolean;
  isTenantCreator?: boolean;
  platform?: string;
}

export interface TenantSessionsQueryParams {
  cursor?: string;
  limit?: number;
  search?: string;
  sortField?: TenantSessionSortField;
  sortDirection?: SortDirection;
  isActive?: boolean;
  platform?: string;
  userUuid?: string;
  expired?: boolean;
}

export interface TenantSessionRevocationResult {
  tenantUuid: string;
  sessionUuid: string;
  action: string;
  revokedBy: string;
  revokedAt: string | null;
  reason: string;
  message: string;
}
