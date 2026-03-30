export type AppSettingType = 'string' | 'boolean' | 'number' | 'json';
export type AppSettingPlatform = 'all' | 'ios' | 'android' | string;

export interface AppSetting {
  settingKey: string;
  settingValue: string | number | boolean | Record<string, unknown> | unknown[] | null;
  settingType: AppSettingType;
  description: string;
  platform: AppSettingPlatform;
  minAppVersion: string | null;
  maxAppVersion: string | null;
  originalValue?: string | number | boolean | Record<string, unknown> | unknown[] | null;
  updatedValue?: string | number | boolean | Record<string, unknown> | unknown[] | null;
  originalValueType?: string | null;
  updatedValueType?: string | null;
  isOverridden?: boolean;
  changeCount?: number;
  lastOriginalFetch?: string | null;
  lastUpdatedAt?: string | null;
  ttl?: number | null;
  versionHistory?: unknown[];
  tenantUuid?: string | null;
  gsi1Pk?: string | null;
  gsi1Sk?: string | null;
  updatedByAdmin?: string | null;
  adminUpdatedAt?: string | null;
}

export interface AppSettingsListResult {
  settings: AppSetting[];
  totalCount: number;
  tenantUuid?: string | null;
  retrievedAt?: string | null;
}

export interface AppSettingInput {
  settingKey?: string;
  settingValue: string | number | boolean | Record<string, unknown> | unknown[] | null;
  settingType: AppSettingType;
  description?: string;
  platform?: AppSettingPlatform;
  minAppVersion?: string | null;
  maxAppVersion?: string | null;
}

export interface AppSettingApiResponse {
  setting_key?: string;
  settingKey?: string;
  setting_value?: unknown;
  settingValue?: unknown;
  setting_type?: string;
  settingType?: string;
  description?: string;
  platform?: string;
  min_app_version?: string;
  minAppVersion?: string;
  max_app_version?: string;
  maxAppVersion?: string;
  original_value?: unknown;
  originalValue?: unknown;
  updated_value?: unknown;
  updatedValue?: unknown;
  original_value_type?: string | null;
  originalValueType?: string | null;
  updated_value_type?: string | null;
  updatedValueType?: string | null;
  is_overridden?: boolean;
  isOverridden?: boolean;
  change_count?: number;
  changeCount?: number;
  last_original_fetch?: string | null;
  lastOriginalFetch?: string | null;
  last_updated_at?: string | null;
  lastUpdatedAt?: string | null;
  ttl?: number;
  version_history?: unknown[];
  versionHistory?: unknown[];
  tenant_uuid?: string | null;
  tenantUuid?: string | null;
  gsi1_pk?: string | null;
  gsi1Pk?: string | null;
  gsi1_sk?: string | null;
  gsi1Sk?: string | null;
  updated_by_admin?: string | null;
  updatedByAdmin?: string | null;
  admin_updated_at?: string | null;
  adminUpdatedAt?: string | null;
}
