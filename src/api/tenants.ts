import { apiClient } from './client';
import type {
  AppSetting,
  AppSettingApiResponse,
  AppSettingInput,
  AppSettingsListResult,
} from '@/types/app-settings';
import type {
  SortDirection,
  TenantCursorPagination,
  TenantPaginationHelp,
  TenantQueryInfo,
  TenantSession,
  TenantSessionRevocationResult,
  TenantSessionsListResult,
  TenantSessionsMetadata,
  TenantSessionsQueryParams,
  TenantSessionActions,
  TenantSessionDeviceInfo,
  TenantSessionUserInfo,
  TenantUser,
  TenantUsersListResult,
  TenantUsersMetadata,
  TenantUsersQueryParams,
} from '@/types/tenant-admin';
import type { Tenant, TenantApiResponse, TenantListResult, TenantSubscriptionInfo } from '@/types/tenant';
import {
  firstDefined,
  isRecord,
  parseListPayload,
  parseSinglePayload,
  readDateIso,
  readBoolean,
  readNumber,
  readOptionalString,
  readString,
  toStringArray,
} from '@/lib/parsers';

export async function listTenants(): Promise<TenantListResult> {
  const response = await apiClient.get<unknown>('/v1/admin/tenants');
  return parseTenantListResult(response.data);
}

export async function getTenant(tenantUuid: string): Promise<Tenant | null> {
  const response = await apiClient.get<unknown>(`/v1/admin/tenants/${encodeURIComponent(tenantUuid)}`);
  return parseSinglePayload(response.data, parseTenant);
}

export async function listTenantAppSettings(tenantUuid: string): Promise<AppSettingsListResult> {
  const response = await apiClient.get<unknown>(
    `/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/app-settings`,
  );
  return parseAppSettingsListResult(response.data);
}

export async function getTenantAppSetting(
  tenantUuid: string,
  settingKey: string,
): Promise<AppSetting | null> {
  const response = await apiClient.get<unknown>(
    `/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/app-settings/${encodeURIComponent(settingKey)}`,
  );
  return parseSinglePayload(response.data, parseAppSetting);
}

export async function createTenantAppSetting(
  tenantUuid: string,
  settingKey: string,
  payload: AppSettingInput,
): Promise<AppSetting | null> {
  const response = await apiClient.put<unknown>(
    `/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/app-settings/${encodeURIComponent(settingKey)}`,
    toAppSettingRequest(payload),
  );
  return parseSinglePayload(response.data, parseAppSetting);
}

export async function updateTenantAppSetting(
  tenantUuid: string,
  settingKey: string,
  payload: AppSettingInput,
): Promise<AppSetting | null> {
  const response = await apiClient.put<unknown>(
    `/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/app-settings/${encodeURIComponent(settingKey)}`,
    toAppSettingRequest(payload),
  );
  return parseSinglePayload(response.data, parseAppSetting);
}

export async function deleteTenantAppSetting(tenantUuid: string, settingKey: string): Promise<AppSetting | null> {
  const response = await apiClient.delete<unknown>(
    `/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/app-settings/${encodeURIComponent(settingKey)}`,
  );
  return parseSinglePayload(response.data, parseAppSetting);
}

export async function listTenantUsers(
  tenantUuid: string,
  params: TenantUsersQueryParams = {},
): Promise<TenantUsersListResult> {
  const response = await apiClient.get<unknown>(`/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/users`, {
    params: toTenantUsersRequestParams(params),
  });
  return parseTenantUsersListResult(response.data);
}

export async function listTenantSessions(
  tenantUuid: string,
  params: TenantSessionsQueryParams = {},
): Promise<TenantSessionsListResult> {
  const response = await apiClient.get<unknown>(`/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/sessions`, {
    params: toTenantSessionsRequestParams(params),
  });
  return parseTenantSessionsListResult(response.data);
}

export async function revokeTenantSession(
  tenantUuid: string,
  sessionUuid: string,
): Promise<TenantSessionRevocationResult | null> {
  const response = await apiClient.delete<unknown>(
    `/v1/admin/tenants/${encodeURIComponent(tenantUuid)}/sessions/${encodeURIComponent(sessionUuid)}`,
  );
  return parseSinglePayload(response.data, parseTenantSessionRevocationResult);
}

export function parseTenantListResult(payload: unknown): TenantListResult {
  const result = parseListPayload(payload, parseTenant, ['tenants', 'data', 'items', 'results']);
  return { tenants: result.items, totalCount: result.totalCount };
}

export function parseTenant(payload: unknown): Tenant {
  const data = isRecord(payload) ? (payload as TenantApiResponse) : {};
  return {
    tenantUuid: readString(data.tenant_uuid ?? data.tenantUuid),
    domainName: readString(data.domain_name ?? data.domainName),
    buildUrl: readString(data.build_url ?? data.buildUrl),
    createdAt: readOptionalString(data.created_at ?? data.createdAt),
    lastSeenAt: readOptionalString(data.last_seen_at ?? data.lastSeenAt),
    isActive: readBoolean(data.is_active ?? data.isActive, false),
    totalUsers: readNumber(data.total_users ?? data.totalUsers),
    totalActiveSessions: readNumber(data.total_active_sessions ?? data.totalActiveSessions),
    subscriptionInfo: parseSubscriptionInfo(data.subscription_info ?? data.subscriptionInfo),
  };
}

export function parseSubscriptionInfo(payload: unknown): TenantSubscriptionInfo {
  const data = isRecord(payload) ? payload : {};
  const maxUsersValue = firstDefined([data.max_users, data.maxUsers]);
  return {
    tier: readString(firstDefined([data.tier, data.subscription_tier, data.plan]), 'standard'),
    features: toStringArray(firstDefined([data.features, data.feature_flags, data.capabilities])),
    maxUsers: maxUsersValue === undefined ? null : readNumber(maxUsersValue, 0),
  };
}

export function parseAppSettingsListResult(payload: unknown): AppSettingsListResult {
  const result = parseListPayload(payload, parseAppSetting, ['settings', 'app_settings', 'data', 'items']);
  const data = isRecord(payload) ? payload : {};
  return {
    settings: result.items,
    totalCount: result.totalCount,
    tenantUuid: readOptionalString(data.tenant_uuid ?? data.tenantUuid),
    retrievedAt: readOptionalString(data.retrieved_at ?? data.retrievedAt),
  };
}

export function parseTenantUsersListResult(payload: unknown): TenantUsersListResult {
  const data = isRecord(payload) ? payload : {};
  const items = parseListPayload(data, parseTenantUser, ['items', 'data', 'results']).items;
  return {
    items,
    pagination: parseTenantPagination(data.pagination, items.length),
    queryInfo: parseTenantQueryInfo(data.query_info ?? data.queryInfo),
    metadata: parseTenantUsersMetadata(data.metadata),
  };
}

export function parseTenantSessionsListResult(payload: unknown): TenantSessionsListResult {
  const data = isRecord(payload) ? payload : {};
  const items = parseListPayload(data, parseTenantSession, ['items', 'data', 'results']).items;
  return {
    items,
    pagination: parseTenantPagination(data.pagination, items.length),
    queryInfo: parseTenantQueryInfo(data.query_info ?? data.queryInfo),
    metadata: parseTenantSessionsMetadata(data.metadata),
  };
}

export function parseAppSetting(payload: unknown): AppSetting {
  const data = isRecord(payload) ? (payload as AppSettingApiResponse) : {};
  const nested = isRecord((data as Record<string, unknown>).setting_data)
    ? ((data as Record<string, unknown>).setting_data as Record<string, unknown>)
    : {};
  const rawOriginalValue = firstDefined([
    data.original_value,
    data.originalValue,
    nested.original_value,
    nested.originalValue,
  ]);
  const rawUpdatedValue = firstDefined([
    data.updated_value,
    data.updatedValue,
    data.setting_value,
    data.settingValue,
    nested.updated_value,
    nested.updatedValue,
    nested.setting_value,
    nested.settingValue,
  ]);
  const rawSettingType = firstDefined([
    data.updated_value_type,
    data.updatedValueType,
    data.setting_type,
    data.settingType,
    data.original_value_type,
    data.originalValueType,
    nested.updated_value_type,
    nested.updatedValueType,
    nested.setting_type,
    nested.settingType,
    nested.original_value_type,
    nested.originalValueType,
  ]);
  const rawValue = firstDefined([
    rawUpdatedValue,
    rawOriginalValue,
    data.setting_value,
    data.settingValue,
    nested.setting_value,
    nested.settingValue,
  ]);
  const settingType = readString(rawSettingType, 'string') as AppSetting['settingType'];

  return {
    settingKey: readString(data.setting_key ?? data.settingKey ?? nested.setting_key ?? nested.settingKey),
    settingValue: parseSettingValue(rawValue),
    settingType,
    description: readString(data.description ?? nested.description),
    platform: readString(data.platform ?? nested.platform, 'all'),
    minAppVersion: readOptionalString(
      data.min_app_version ?? data.minAppVersion ?? nested.min_app_version ?? nested.minAppVersion,
    ),
    maxAppVersion: readOptionalString(
      data.max_app_version ?? data.maxAppVersion ?? nested.max_app_version ?? nested.maxAppVersion,
    ),
    originalValue: parseSettingValue(rawOriginalValue),
    updatedValue: parseSettingValue(rawUpdatedValue),
    originalValueType: readOptionalString(
      data.original_value_type ?? data.originalValueType ?? nested.original_value_type ?? nested.originalValueType,
    ),
    updatedValueType: readOptionalString(
      data.updated_value_type ?? data.updatedValueType ?? nested.updated_value_type ?? nested.updatedValueType,
    ),
    isOverridden: readBoolean(data.is_overridden ?? data.isOverridden ?? nested.is_overridden ?? nested.isOverridden, false),
    changeCount: readNumber(data.change_count ?? data.changeCount ?? nested.change_count ?? nested.changeCount, 0),
    lastOriginalFetch: readOptionalString(
      data.last_original_fetch ?? data.lastOriginalFetch ?? nested.last_original_fetch ?? nested.lastOriginalFetch,
    ),
    lastUpdatedAt: readOptionalString(
      data.last_updated_at ?? data.lastUpdatedAt ?? nested.last_updated_at ?? nested.lastUpdatedAt,
    ),
    ttl: firstDefined([data.ttl, nested.ttl]) === undefined ? null : readNumber(firstDefined([data.ttl, nested.ttl]), 0),
    versionHistory: toUnknownArray(firstDefined([data.version_history, data.versionHistory, nested.version_history, nested.versionHistory])),
    tenantUuid: readOptionalString(data.tenant_uuid ?? data.tenantUuid ?? nested.tenant_uuid ?? nested.tenantUuid),
    gsi1Pk: readOptionalString(data.gsi1_pk ?? data.gsi1Pk ?? nested.gsi1_pk ?? nested.gsi1Pk),
    gsi1Sk: readOptionalString(data.gsi1_sk ?? data.gsi1Sk ?? nested.gsi1_sk ?? nested.gsi1Sk),
    updatedByAdmin: readOptionalString(
      data.updated_by_admin ?? data.updatedByAdmin ?? nested.updated_by_admin ?? nested.updatedByAdmin,
    ),
    adminUpdatedAt: readOptionalString(
      data.admin_updated_at ?? data.adminUpdatedAt ?? nested.admin_updated_at ?? nested.adminUpdatedAt,
    ),
  };
}

export function parseTenantUser(payload: unknown): TenantUser {
  const data = isRecord(payload) ? payload : {};
  return {
    userUuid: readString(firstDefined([data.user_uuid, data.userUuid])),
    tenantUuid: readString(firstDefined([data.tenant_uuid, data.tenantUuid])),
    tenantUserId: readString(firstDefined([data.tenant_user_id, data.tenantUserId])),
    userName: readString(firstDefined([data.user_name, data.userName])),
    firstName: readString(firstDefined([data.first_name, data.firstName])),
    middleName: readString(firstDefined([data.middle_name, data.middleName]), ''),
    lastName: readString(firstDefined([data.last_name, data.lastName])),
    isAdUser: readBoolean(firstDefined([data.is_ad_user, data.isAdUser]), false),
    roles: parseTenantUserRoles(firstDefined([data.roles, data.role_list, data.roleList])),
    isTenantCreator: readBoolean(firstDefined([data.is_tenant_creator, data.isTenantCreator]), false),
    firstSeenAt: parseIsoDate(firstDefined([data.first_seen_at, data.firstSeenAt])),
    lastSeenAt: parseIsoDate(firstDefined([data.last_seen_at, data.lastSeenAt])),
    isActive: readBoolean(firstDefined([data.is_active, data.isActive]), false),
    accountLocked: readBoolean(firstDefined([data.account_locked, data.accountLocked]), false),
    dataSource: readOptionalString(firstDefined([data.data_source, data.dataSource])),
    totalAuthCount: readNumber(firstDefined([data.total_auth_count, data.totalAuthCount]), 0),
    activeSessionsCount: readNumber(firstDefined([data.active_sessions_count, data.activeSessionsCount]), 0),
    lastPlatform: readOptionalString(firstDefined([data.last_platform, data.lastPlatform])),
    lastAppVersion: readOptionalString(firstDefined([data.last_app_version, data.lastAppVersion])),
    preferences: parseRecord(firstDefined([data.preferences])),
  };
}

export function parseTenantSession(payload: unknown): TenantSession {
  const data = isRecord(payload) ? payload : {};
  return {
    sessionUuid: readString(firstDefined([data.session_uuid, data.sessionUuid])),
    userUuid: readString(firstDefined([data.user_uuid, data.userUuid])),
    tenantUuid: readString(firstDefined([data.tenant_uuid, data.tenantUuid])),
    platform: readString(firstDefined([data.platform]), 'unknown'),
    appVersion: readString(firstDefined([data.app_version, data.appVersion])),
    deviceInfo: parseTenantSessionDeviceInfo(firstDefined([data.device_info, data.deviceInfo])),
    createdAt: parseIsoDate(firstDefined([data.created_at, data.createdAt])),
    lastActivity: parseIsoDate(firstDefined([data.last_activity, data.lastActivity])),
    expiresAt: parseIsoDate(firstDefined([data.expires_at, data.expiresAt])),
    isActive: readBoolean(firstDefined([data.is_active, data.isActive]), false),
    isExpired: readBoolean(firstDefined([data.is_expired, data.isExpired]), false),
    timeUntilExpiry: readNumber(firstDefined([data.time_until_expiry, data.timeUntilExpiry]), 0),
    tenantTokenStatus: readOptionalString(firstDefined([data.tenant_token_status, data.tenantTokenStatus])),
    tenantTokenExpiresAt: parseIsoDate(firstDefined([data.tenant_token_expires_at, data.tenantTokenExpiresAt])),
    tenantTokenLastUsed: parseIsoDate(firstDefined([data.tenant_token_last_used, data.tenantTokenLastUsed])),
    tenantTokenRefreshCount: readNumber(
      firstDefined([data.tenant_token_refresh_count, data.tenantTokenRefreshCount]),
      0,
    ),
    revokedAt: parseIsoDate(firstDefined([data.revoked_at, data.revokedAt])),
    revokedReason: readOptionalString(firstDefined([data.revoked_reason, data.revokedReason])),
    ipAddress: emptyStringToNull(readOptionalString(firstDefined([data.ip_address, data.ipAddress]))),
    userAgent: emptyStringToNull(readOptionalString(firstDefined([data.user_agent, data.userAgent]))),
    authMethod: readString(firstDefined([data.auth_method, data.authMethod])),
    ttl: firstDefined([data.ttl]) === undefined ? null : readNumber(firstDefined([data.ttl]), 0),
    refreshCount: readNumber(firstDefined([data.refresh_count, data.refreshCount]), 0),
    apiCallsCount: readNumber(firstDefined([data.api_calls_count, data.apiCallsCount]), 0),
    tenantApiCallsCount: readNumber(firstDefined([data.tenant_api_calls_count, data.tenantApiCallsCount]), 0),
    userInfo: parseTenantSessionUserInfo(firstDefined([data.user_info, data.userInfo])),
  };
}

export function parseTenantSessionRevocationResult(payload: unknown): TenantSessionRevocationResult {
  const data = isRecord(payload) ? payload : {};
  return {
    tenantUuid: readString(firstDefined([data.tenant_uuid, data.tenantUuid])),
    sessionUuid: readString(firstDefined([data.session_uuid, data.sessionUuid])),
    action: readString(firstDefined([data.action])),
    revokedBy: readString(firstDefined([data.revoked_by, data.revokedBy])),
    revokedAt: parseIsoDate(firstDefined([data.revoked_at, data.revokedAt])),
    reason: readString(firstDefined([data.reason])),
    message: readString(firstDefined([data.message])),
  };
}

export function parseTenantPagination(
  payload: unknown,
  fallbackTotalReturned = 0,
): TenantCursorPagination {
  const data = isRecord(payload) ? payload : {};
  const rawLimit = firstDefined([data.limit]);
  const rawNextCursor = firstDefined([data.next_cursor, data.nextCursor]);
  const rawHasMore = firstDefined([data.has_more, data.hasMore]);
  const rawTotalReturned = firstDefined([data.total_returned, data.totalReturned]);

  return {
    limit: rawLimit === undefined ? fallbackTotalReturned : readNumber(rawLimit, fallbackTotalReturned),
    hasMore: readBoolean(rawHasMore, false),
    nextCursor: readOptionalString(rawNextCursor),
    totalReturned: rawTotalReturned === undefined ? fallbackTotalReturned : readNumber(rawTotalReturned, fallbackTotalReturned),
  };
}

export function parseTenantQueryInfo(payload: unknown): TenantQueryInfo | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    tenantUuid: readString(firstDefined([payload.tenant_uuid, payload.tenantUuid])),
    searchTerm: readOptionalString(firstDefined([payload.search_term, payload.searchTerm])),
    sortField: readOptionalString(firstDefined([payload.sort_field, payload.sortField])),
    sortDirection: parseSortDirection(firstDefined([payload.sort_direction, payload.sortDirection])),
    filtersApplied: toStringArray(firstDefined([payload.filters_applied, payload.filtersApplied])),
  };
}

export function parseTenantUsersMetadata(payload: unknown): TenantUsersMetadata | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    tenantUuid: readString(firstDefined([payload.tenant_uuid, payload.tenantUuid])),
    requestTimestamp: parseIsoDate(firstDefined([payload.request_timestamp, payload.requestTimestamp])),
    adminEmail: readOptionalString(firstDefined([payload.admin_email, payload.adminEmail])),
    availableFilters: toStringArray(firstDefined([payload.available_filters, payload.availableFilters])),
    availableSortFields: toStringArray(firstDefined([payload.available_sort_fields, payload.availableSortFields])),
    paginationHelp: parseTenantPaginationHelp(firstDefined([payload.pagination_help, payload.paginationHelp])),
  };
}

export function parseTenantSessionsMetadata(payload: unknown): TenantSessionsMetadata | null {
  const metadata = parseTenantUsersMetadata(payload);
  if (!metadata) {
    return null;
  }

  const data = isRecord(payload) ? payload : {};
  return {
    ...metadata,
    sessionActions: parseTenantSessionActions(firstDefined([data.session_actions, data.sessionActions])),
  };
}

export function parseTenantPaginationHelp(payload: unknown): TenantPaginationHelp | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    cursorUsage: readOptionalString(firstDefined([payload.cursor_usage, payload.cursorUsage])),
    limitRange: readOptionalString(firstDefined([payload.limit_range, payload.limitRange])),
    searchFields: toStringArray(firstDefined([payload.search_fields, payload.searchFields])),
  };
}

export function parseTenantSessionActions(payload: unknown): TenantSessionActions | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    revokeSession: readOptionalString(firstDefined([payload.revoke_session, payload.revokeSession])),
  };
}

export function parseTenantSessionDeviceInfo(payload: unknown): TenantSessionDeviceInfo | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    deviceId: readOptionalString(firstDefined([payload.device_id, payload.deviceId])),
    osVersion: readOptionalString(firstDefined([payload.os_version, payload.osVersion])),
    appVersion: readOptionalString(firstDefined([payload.app_version, payload.appVersion])),
    platform: readOptionalString(firstDefined([payload.platform])),
  };
}

export function parseTenantSessionUserInfo(payload: unknown): TenantSessionUserInfo | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    userName: readString(firstDefined([payload.user_name, payload.userName])),
    firstName: readString(firstDefined([payload.first_name, payload.firstName])),
    lastName: readString(firstDefined([payload.last_name, payload.lastName])),
  };
}

export function parseSettingValue(value: unknown): AppSetting['settingValue'] {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return '';
    }

    try {
      return JSON.parse(trimmed) as AppSetting['settingValue'];
    } catch {
      if (trimmed === 'true') {
        return true;
      }

      if (trimmed === 'false') {
        return false;
      }

      const numeric = Number(trimmed);
      return Number.isFinite(numeric) && trimmed !== '' ? numeric : trimmed;
    }
  }

  if (Array.isArray(value) || isRecord(value)) {
    return value as Record<string, unknown>;
  }

  return readString(value);
}

function toAppSettingRequest(payload: AppSettingInput): Record<string, unknown> {
  return {
    updated_value: payload.settingValue,
  };
}

function toTenantUsersRequestParams(params: TenantUsersQueryParams): Record<string, unknown> {
  return compactQueryParams({
    cursor: params.cursor,
    limit: params.limit,
    search: params.search,
    sort_field: params.sortField,
    sort_direction: params.sortDirection,
    is_active: params.isActive,
    is_ad_user: params.isAdUser,
    is_tenant_creator: params.isTenantCreator,
    platform: params.platform,
  });
}

function toTenantSessionsRequestParams(params: TenantSessionsQueryParams): Record<string, unknown> {
  return compactQueryParams({
    cursor: params.cursor,
    limit: params.limit,
    search: params.search,
    sort_field: params.sortField,
    sort_direction: params.sortDirection,
    is_active: params.isActive,
    platform: params.platform,
    user_uuid: params.userUuid,
    expired: params.expired,
  });
}

function compactQueryParams(params: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(params).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    if (value === undefined || value === null) {
      return accumulator;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function parseTenantUserRoles(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    return toStringArray(payload);
  }

  return payload
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (isRecord(item)) {
        return readString(firstDefined([item.RoleName, item.role_name, item.roleName]), '');
      }

      return '';
    })
    .filter((value) => value.length > 0);
}

function parseRecord(payload: unknown): Record<string, unknown> | null {
  return isRecord(payload) ? payload : null;
}

function emptyStringToNull(value: string | null): string | null {
  return value && value.trim().length > 0 ? value : null;
}

function parseIsoDate(value: unknown): string | null {
  return readDateIso(value);
}

function parseSortDirection(value: unknown): SortDirection | null {
  const direction = readOptionalString(value);
  if (direction === 'asc' || direction === 'desc') {
    return direction;
  }

  return null;
}

function toUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
