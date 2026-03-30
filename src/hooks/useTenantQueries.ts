import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTenantAppSetting,
  deleteTenantAppSetting,
  getTenant,
  getTenantAppSetting,
  listTenantAppSettings,
  listTenantSessions,
  listTenantUsers,
  listTenants,
  revokeTenantSession,
  updateTenantAppSetting,
} from '@/api/tenants';
import type { AppSettingInput } from '@/types/app-settings';
import type { TenantSessionsQueryParams, TenantUsersQueryParams } from '@/types/tenant-admin';

export function useTenantsQuery() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
  });
}

export function useTenantQuery(tenantUuid: string) {
  return useQuery({
    queryKey: ['tenants', tenantUuid],
    queryFn: () => getTenant(tenantUuid),
    enabled: tenantUuid.length > 0,
  });
}

export function useTenantAppSettingsQuery(tenantUuid: string, enabled = true) {
  return useQuery({
    queryKey: ['tenants', tenantUuid, 'app-settings'],
    queryFn: () => listTenantAppSettings(tenantUuid),
    enabled: tenantUuid.length > 0 && enabled,
  });
}

export function useTenantAppSettingQuery(tenantUuid: string, settingKey: string) {
  return useQuery({
    queryKey: ['tenants', tenantUuid, 'app-settings', settingKey],
    queryFn: () => getTenantAppSetting(tenantUuid, settingKey),
    enabled: tenantUuid.length > 0 && settingKey.length > 0,
  });
}

export function useTenantUsersQuery(
  tenantUuid: string,
  params: TenantUsersQueryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['tenants', tenantUuid, 'users', params],
    queryFn: () => listTenantUsers(tenantUuid, params),
    enabled: tenantUuid.length > 0 && enabled,
  });
}

export function useTenantSessionsQuery(
  tenantUuid: string,
  params: TenantSessionsQueryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['tenants', tenantUuid, 'sessions', params],
    queryFn: () => listTenantSessions(tenantUuid, params),
    enabled: tenantUuid.length > 0 && enabled,
  });
}

export function useUpsertTenantAppSettingMutation(tenantUuid: string, settingKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AppSettingInput) =>
      updateTenantAppSetting(tenantUuid, settingKey, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid, 'app-settings'] });
      void queryClient.invalidateQueries({
        queryKey: ['tenants', tenantUuid, 'app-settings', settingKey],
      });
    },
  });
}

export function useCreateTenantAppSettingMutation(tenantUuid: string, settingKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AppSettingInput) =>
      createTenantAppSetting(tenantUuid, settingKey, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid, 'app-settings'] });
    },
  });
}

export function useDeleteTenantAppSettingMutation(tenantUuid: string, settingKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTenantAppSetting(tenantUuid, settingKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid, 'app-settings'] });
      void queryClient.invalidateQueries({
        queryKey: ['tenants', tenantUuid, 'app-settings', settingKey],
      });
    },
  });
}

export function useRevokeTenantSessionMutation(tenantUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionUuid: string) => revokeTenantSession(tenantUuid, sessionUuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid, 'sessions'] });
      void queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid] });
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}
