import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Skeleton,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  deleteTenantAppSetting,
  updateTenantAppSetting,
} from '../api/tenants';
import { EmptyState, ErrorState, LoadingState, PageHeader, SectionCard, StatCard, StatusChip } from '../components';
import {
  useRevokeTenantSessionMutation,
  useTenantAppSettingsQuery,
  useTenantQuery,
  useTenantSessionsQuery,
  useTenantUsersQuery,
} from '../hooks';
import type { AppSetting, AppSettingInput, AppSettingType } from '../types/app-settings';
import type { TenantSession, TenantUser } from '../types/tenant-admin';

type SettingFormState = {
  settingKey: string;
  settingValue: string;
  settingType: AppSettingType;
  description: string;
  platform: 'all' | 'ios' | 'android';
  minAppVersion: string;
  maxAppVersion: string;
};

type FieldErrors = Record<keyof SettingFormState, string>;
type FormTouched = Record<keyof SettingFormState, boolean>;
type Banner = { severity: 'success' | 'error' | 'warning' | 'info'; message: string } | null;
type BooleanFilter = 'all' | 'true' | 'false';
type SortDirection = 'asc' | 'desc';

type UsersTabProps = {
  tenantUuid: string;
  active: boolean;
  onOpenSessionsForUser: (userUuid: string) => void;
};

type SessionsTabProps = {
  tenantUuid: string;
  active: boolean;
  userUuidFilter: string;
  onUserUuidFilterChange: (value: string) => void;
  onNotify: (banner: Banner) => void;
};

const emptyFormState: SettingFormState = {
  settingKey: '',
  settingValue: '',
  settingType: 'string',
  description: '',
  platform: 'all',
  minAppVersion: '',
  maxAppVersion: '',
};

const tabLabels = ['Overview', 'App Settings', 'Users', 'Sessions', 'Audit Log'] as const;
const tabParamMap: Record<string, number> = {
  overview: 0,
  'app-settings': 1,
  users: 2,
  sessions: 3,
  'audit-log': 4,
};
const tabIndexMap = ['overview', 'app-settings', 'users', 'sessions', 'audit-log'] as const;
const usersSortFieldOptions = [
  { label: 'Last seen', value: 'last_seen_at' },
  { label: 'Created', value: 'created_at' },
  { label: 'Username', value: 'user_name' },
  { label: 'First name', value: 'first_name' },
  { label: 'Last name', value: 'last_name' },
  { label: 'Auth count', value: 'total_auth_count' },
] as const;
const sessionSortFieldOptions = [
  { label: 'Last activity', value: 'last_activity' },
  { label: 'Created', value: 'created_at' },
  { label: 'Expires', value: 'expires_at' },
  { label: 'Platform', value: 'platform' },
  { label: 'App version', value: 'app_version' },
] as const;
const defaultPageSize = 25;

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Unknown';
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Unknown';
}

function formatTimeAgo(value: string | null) {
  if (!value) {
    return 'Unknown';
  }

  const diffMs = Date.now() - Date.parse(value);
  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 'Unknown';
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return formatDate(value);
}

function formatSettingValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function normalizeFormValue(
  settingType: AppSettingType,
  value: AppSetting['settingValue'] | undefined,
): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (settingType) {
    case 'boolean':
      return String(value).toLowerCase();
    case 'json':
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    default:
      return String(value);
  }
}

function createEmptyTouched(): FormTouched {
  return {
    settingKey: false,
    settingValue: false,
    settingType: false,
    description: false,
    platform: false,
    minAppVersion: false,
    maxAppVersion: false,
  };
}

function createEmptyFieldErrors(): FieldErrors {
  return {
    settingKey: '',
    settingValue: '',
    settingType: '',
    description: '',
    platform: '',
    minAppVersion: '',
    maxAppVersion: '',
  };
}

function validateSettingValue(settingType: AppSettingType, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Setting value is required.';
  }

  switch (settingType) {
    case 'boolean':
      return /^(true|false)$/i.test(trimmed) ? '' : 'Enter `true` or `false`.';
    case 'number':
      return Number.isFinite(Number(trimmed)) ? '' : 'Enter a valid number.';
    case 'json':
      try {
        JSON.parse(trimmed);
        return '';
      } catch {
        return 'Enter valid JSON.';
      }
    default:
      return '';
  }
}

function parseFormValue(
  settingType: AppSettingType,
  value: string,
): AppSetting['settingValue'] {
  switch (settingType) {
    case 'boolean':
      return value.trim().toLowerCase() === 'true';
    case 'number':
      return Number(value);
    case 'json':
      return value.trim() ? (JSON.parse(value) as Record<string, unknown>) : {};
    default:
      return value;
  }
}

function toSettingFormState(setting: AppSetting): SettingFormState {
  return {
    settingKey: setting.settingKey,
    settingValue: normalizeFormValue(
      (setting.updatedValueType ?? setting.settingType) as AppSettingType,
      setting.updatedValue ?? setting.settingValue ?? setting.originalValue,
    ),
    settingType: ((setting.updatedValueType ?? setting.settingType) as AppSettingType) || 'string',
    description: setting.description,
    platform: setting.platform === 'ios' || setting.platform === 'android' ? setting.platform : 'all',
    minAppVersion: setting.minAppVersion ?? '',
    maxAppVersion: setting.maxAppVersion ?? '',
  };
}

function PlaceholderPanel({
  title,
  copy,
  items,
}: {
  title: string;
  copy: string;
  items: string[];
}) {
  return (
    <SectionCard sx={{ backgroundColor: '#f8fbfc' }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 620 }}>
            {copy}
          </Typography>
        </Box>
        <Alert severity="info" variant="outlined">
          This tab is intentionally read-only until its backend endpoint is available.
        </Alert>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {items.map((item) => (
            <Chip key={item} label={item} size="small" variant="outlined" />
          ))}
        </Stack>
      </Stack>
    </SectionCard>
  );
}

function formatDurationSeconds(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Unknown';
  }

  if (value <= 0) {
    return 'Expired';
  }

  const minutes = Math.floor(value / 60);
  if (minutes < 1) {
    return `${value}s`;
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatExpiryLabel(value: number | null, isExpired: boolean) {
  if (isExpired) {
    return 'Expired';
  }

  const duration = formatDurationSeconds(value);
  return duration === 'Unknown' ? duration : `In ${duration}`;
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return 'Unknown';
  }

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isYes(value: BooleanFilter) {
  return value === 'true';
}

function useCursorPager() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const reset = () => {
    setCursor(null);
    setCursorHistory([]);
    setPageIndex(0);
  };

  const goNext = (nextCursor: string | null) => {
    if (!nextCursor) {
      return;
    }

    setCursorHistory((current) => [...current, cursor]);
    setCursor(nextCursor);
    setPageIndex((current) => current + 1);
  };

  const goPrevious = () => {
    setCursorHistory((current) => {
      if (!current.length) {
        return current;
      }

      const previousCursor = current[current.length - 1];
      setCursor(previousCursor ?? null);
      setPageIndex((currentPage) => Math.max(0, currentPage - 1));
      return current.slice(0, -1);
    });
  };

  return {
    cursor,
    pageIndex,
    hasPrevious: cursorHistory.length > 0,
    reset,
    goNext,
    goPrevious,
  };
}

function UsersTabPanel({ tenantUuid, active, onOpenSessionsForUser }: UsersTabProps) {
  const pager = useCursorPager();
  const { pageIndex } = pager;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BooleanFilter>('all');
  const [adUserFilter, setAdUserFilter] = useState<BooleanFilter>('all');
  const [creatorFilter, setCreatorFilter] = useState<BooleanFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ios' | 'android'>('all');
  const [sortField, setSortField] = useState<(typeof usersSortFieldOptions)[number]['value']>('last_seen_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    pager.reset();
  }, [search, statusFilter, adUserFilter, creatorFilter, platformFilter, sortField, sortDirection]);

  const query = useTenantUsersQuery(
    tenantUuid,
    {
      limit: defaultPageSize,
      cursor: pager.cursor ?? undefined,
      search: search.trim() || undefined,
      sortField,
      sortDirection,
      isActive: statusFilter === 'all' ? undefined : isYes(statusFilter),
      isAdUser: adUserFilter === 'all' ? undefined : isYes(adUserFilter),
      isTenantCreator: creatorFilter === 'all' ? undefined : isYes(creatorFilter),
      platform: platformFilter === 'all' ? undefined : platformFilter,
    },
    active,
  );

  const result = query.data ?? null;
  const users = result?.items ?? [];
  const pagination = result?.pagination ?? null;
  const queryInfo = result?.queryInfo ?? null;
  const isInitialLoading = query.isPending && !result && !query.isError;
  const activeCount = users.filter((user) => user.isActive).length;
  const adCount = users.filter((user) => user.isAdUser).length;
  const creatorCount = users.filter((user) => user.isTenantCreator).length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setAdUserFilter('all');
    setCreatorFilter('all');
    setPlatformFilter('all');
    setSortField('last_seen_at');
    setSortDirection('desc');
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Users
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 760 }}>
            Tenant user directory with active-status, AD, creator, and platform filters. Open a user&apos;s session
            history from the action column.
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {queryInfo?.sortField
              ? `Sorted by ${queryInfo.sortField}${queryInfo.sortDirection ? ` · ${queryInfo.sortDirection}` : ''}`
              : 'Current tenant user listing'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <StatusChip label={`${users.length} shown`} tone="default" />
          <StatusChip label={`${activeCount} active`} tone="success" />
          <StatusChip label={`${adCount} AD`} tone="info" />
          <StatusChip label={`${creatorCount} creators`} tone="warning" />
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="User, name, email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as BooleanFilter);
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
        <TextField
          select
          label="AD"
          size="small"
          value={adUserFilter}
          onChange={(event) => {
            setAdUserFilter(event.target.value as BooleanFilter);
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="true">AD users</MenuItem>
          <MenuItem value="false">Non-AD</MenuItem>
        </TextField>
        <TextField
          select
          label="Creator"
          size="small"
          value={creatorFilter}
          onChange={(event) => {
            setCreatorFilter(event.target.value as BooleanFilter);
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="true">Tenant creators</MenuItem>
          <MenuItem value="false">Others</MenuItem>
        </TextField>
        <TextField
          select
          label="Platform"
          size="small"
          value={platformFilter}
          onChange={(event) => {
            setPlatformFilter(event.target.value as 'all' | 'ios' | 'android');
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="ios">iOS</MenuItem>
          <MenuItem value="android">Android</MenuItem>
        </TextField>
        <TextField
          select
          label="Sort field"
          size="small"
          value={sortField}
          onChange={(event) => {
            setSortField(event.target.value as (typeof usersSortFieldOptions)[number]['value']);
          }}
          fullWidth
        >
          {usersSortFieldOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Sort order"
          size="small"
          value={sortDirection}
          onChange={(event) => {
            setSortDirection(event.target.value as SortDirection);
          }}
          fullWidth
        >
          <MenuItem value="desc">Newest first</MenuItem>
          <MenuItem value="asc">Oldest first</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: { xs: 'flex-start', xl: 'flex-end' } }}>
          <Button onClick={clearFilters} size="small" variant="text" disabled={!search && statusFilter === 'all' && adUserFilter === 'all' && creatorFilter === 'all' && platformFilter === 'all' && sortField === 'last_seen_at' && sortDirection === 'desc'}>
            Clear filters
          </Button>
        </Box>
      </Box>

      {query.isError && !users.length ? (
        <ErrorState
          title="Users unavailable"
          description="The live tenant users endpoint could not be loaded. Retry once the backend is reachable."
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.isError && !users.length && !isInitialLoading ? (
        <EmptyState
          title="No users found"
          description="No tenant users matched the current search and filter criteria."
        />
      ) : null}

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.25,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: 'none',
        }}
      >
        {query.isFetching ? <LinearProgress sx={{ height: 3 }} /> : null}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 1220 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>User</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Roles</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Last seen</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Platform</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Usage</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isInitialLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`users-skeleton-${index}`}>
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <TableCell key={`${index}-${cellIndex}`}>
                          <Skeleton variant="text" width={cellIndex === 0 ? '90%' : '70%'} />
                          {cellIndex === 0 ? <Skeleton variant="text" width="55%" /> : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : users.map((user) => (
                    <TableRow
                      key={user.userUuid}
                      hover
                      sx={{
                        '& .MuiTableCell-root': {
                          py: 1,
                          borderBottomColor: 'rgba(16,24,40,0.06)',
                        },
                      }}
                    >
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Stack spacing={0.25}>
                          <Typography sx={{ fontWeight: 800, fontSize: 14.25, wordBreak: 'break-word' }}>
                            {user.userName || 'Unknown user'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || 'Unnamed profile'} ·{' '}
                            {user.tenantUserId || 'No tenant user ID'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                            {user.userUuid}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          {user.roles.length ? (
                            user.roles.slice(0, 3).map((role) => (
                              <Chip key={role} size="small" label={role} variant="outlined" />
                            ))
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: 13.5, wordBreak: 'break-word' }}>
                              No roles reported
                            </Typography>
                          )}
                          {user.roles.length > 3 ? (
                            <Chip size="small" label={`+${user.roles.length - 3} more`} variant="outlined" />
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap">
                          <StatusChip label={user.isActive ? 'Active' : 'Inactive'} tone={user.isActive ? 'success' : 'warning'} />
                          <Chip size="small" label={user.isAdUser ? 'AD' : 'Local'} variant="outlined" />
                          {user.isTenantCreator ? <Chip size="small" label="Creator" variant="outlined" /> : null}
                          {user.accountLocked ? <Chip size="small" label="Locked" color="warning" variant="outlined" /> : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                            {formatTimeAgo(user.lastSeenAt)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            First seen {formatTimeAgo(user.firstSeenAt)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                            {formatLabel(user.lastPlatform)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {user.lastAppVersion ? `App ${user.lastAppVersion}` : 'App version unavailable'}
                            {user.dataSource ? ` · ${formatLabel(user.dataSource)}` : ''}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                            {user.totalAuthCount} auths
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {user.activeSessionsCount} active sessions
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<OpenInNewIcon fontSize="small" />}
                          onClick={() => onOpenSessionsForUser(user.userUuid)}
                        >
                          Sessions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Page {pageIndex + 1}
          {pagination ? ` · ${pagination.totalReturned} returned` : ''}
          {pagination?.hasMore ? '' : ' · End of list'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={pager.goPrevious} disabled={!pager.hasPrevious || query.isFetching}>
            Previous
          </Button>
          <Button
            size="small"
            onClick={() => pager.goNext(pagination?.nextCursor ?? null)}
            disabled={!pagination?.hasMore || !pagination?.nextCursor || query.isFetching}
          >
            Next
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

function SessionsTabPanel({ tenantUuid, active, userUuidFilter, onUserUuidFilterChange, onNotify }: SessionsTabProps) {
  const pager = useCursorPager();
  const { pageIndex } = pager;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BooleanFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ios' | 'android'>('all');
  const [expiredFilter, setExpiredFilter] = useState<BooleanFilter>('all');
  const [sortField, setSortField] = useState<(typeof sessionSortFieldOptions)[number]['value']>('last_activity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuSession, setMenuSession] = useState<TenantSession | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<TenantSession | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    pager.reset();
  }, [search, statusFilter, platformFilter, expiredFilter, userUuidFilter, sortField, sortDirection]);

  const revokeSessionMutation = useRevokeTenantSessionMutation(tenantUuid);
  const query = useTenantSessionsQuery(
    tenantUuid,
    {
      limit: defaultPageSize,
      cursor: pager.cursor ?? undefined,
      search: search.trim() || undefined,
      sortField,
      sortDirection,
      isActive: statusFilter === 'all' ? undefined : isYes(statusFilter),
      platform: platformFilter === 'all' ? undefined : platformFilter,
      userUuid: userUuidFilter.trim() || undefined,
      expired: expiredFilter === 'all' ? undefined : isYes(expiredFilter),
    },
    active,
  );

  const result = query.data ?? null;
  const sessions = result?.items ?? [];
  const pagination = result?.pagination ?? null;
  const queryInfo = result?.queryInfo ?? null;
  const isInitialLoading = query.isPending && !result && !query.isError;
  const activeCount = sessions.filter((session) => session.isActive).length;
  const expiredCount = sessions.filter((session) => session.isExpired).length;
  const iOSCount = sessions.filter((session) => session.platform.toLowerCase() === 'ios').length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPlatformFilter('all');
    setExpiredFilter('all');
    onUserUuidFilterChange('');
    setSortField('last_activity');
    setSortDirection('desc');
  };

  const openMenu = (event: MouseEvent<HTMLElement>, session: TenantSession) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuSession(session);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuSession(null);
  };

  const openRevokeDialog = () => {
    if (!menuSession) {
      return;
    }

    setRevokeTarget(menuSession);
    closeMenu();
  };

  const handleRevoke = async () => {
    if (!revokeTarget) {
      return;
    }

    setIsRevoking(true);

    try {
      await revokeSessionMutation.mutateAsync(revokeTarget.sessionUuid);
      onNotify({ severity: 'success', message: `Revoked session "${revokeTarget.sessionUuid}".` });
      setRevokeTarget(null);
    } catch (error) {
      onNotify({
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unable to revoke the selected session.',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Sessions
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 760 }}>
            Monitor active and expired tenant sessions, inspect device context, and revoke access when needed.
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {queryInfo?.sortField
              ? `Sorted by ${queryInfo.sortField}${queryInfo.sortDirection ? ` · ${queryInfo.sortDirection}` : ''}`
              : 'Current tenant session listing'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <StatusChip label={`${sessions.length} shown`} tone="default" />
          <StatusChip label={`${activeCount} active`} tone="success" />
          <StatusChip label={`${expiredCount} expired`} tone="warning" />
          <StatusChip label={`${iOSCount} iOS`} tone="info" />
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="User, platform, IP"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <TextField
          label="User UUID"
          size="small"
          value={userUuidFilter}
          onChange={(event) => {
            onUserUuidFilterChange(event.target.value);
          }}
          placeholder="usr_..."
          fullWidth
        />
        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as BooleanFilter);
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
        <TextField
          select
          label="Expired"
          size="small"
          value={expiredFilter}
          onChange={(event) => {
            setExpiredFilter(event.target.value as BooleanFilter);
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="true">Expired</MenuItem>
          <MenuItem value="false">Live</MenuItem>
        </TextField>
        <TextField
          select
          label="Platform"
          size="small"
          value={platformFilter}
          onChange={(event) => {
            setPlatformFilter(event.target.value as 'all' | 'ios' | 'android');
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="ios">iOS</MenuItem>
          <MenuItem value="android">Android</MenuItem>
        </TextField>
        <TextField
          select
          label="Sort field"
          size="small"
          value={sortField}
          onChange={(event) => {
            setSortField(event.target.value as (typeof sessionSortFieldOptions)[number]['value']);
          }}
          fullWidth
        >
          {sessionSortFieldOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Sort order"
          size="small"
          value={sortDirection}
          onChange={(event) => {
            setSortDirection(event.target.value as SortDirection);
          }}
          fullWidth
        >
          <MenuItem value="desc">Newest first</MenuItem>
          <MenuItem value="asc">Oldest first</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: { xs: 'flex-start', xl: 'flex-end' } }}>
          <Button
            onClick={clearFilters}
            size="small"
            variant="text"
            disabled={
              !search &&
              statusFilter === 'all' &&
              platformFilter === 'all' &&
              expiredFilter === 'all' &&
              !userUuidFilter &&
              sortField === 'last_activity' &&
              sortDirection === 'desc'
            }
          >
            Clear filters
          </Button>
        </Box>
      </Box>

      {query.isError && !sessions.length ? (
        <ErrorState
          title="Sessions unavailable"
          description="The live tenant sessions endpoint could not be loaded. Retry once the backend is reachable."
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.isError && !sessions.length && !isInitialLoading ? (
        <EmptyState
          title="No sessions found"
          description="No tenant sessions matched the current search and filter criteria."
        />
      ) : null}

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.25,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: 'none',
        }}
      >
        {query.isFetching ? <LinearProgress sx={{ height: 3 }} /> : null}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 1480 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Session</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>User</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Device</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Activity</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Expiry</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>Usage</TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isInitialLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`sessions-skeleton-${index}`}>
                      {Array.from({ length: 8 }).map((__, cellIndex) => (
                        <TableCell key={`${index}-${cellIndex}`}>
                          <Skeleton variant="text" width={cellIndex === 0 ? '90%' : '70%'} />
                          {cellIndex === 0 ? <Skeleton variant="text" width="55%" /> : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : sessions.map((session) => (
                    <TableRow
                      key={session.sessionUuid}
                      hover
                      sx={{
                        '& .MuiTableCell-root': {
                          py: 1,
                          borderBottomColor: 'rgba(16,24,40,0.06)',
                        },
                      }}
                    >
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Stack spacing={0.25}>
                          <Typography sx={{ fontWeight: 800, fontSize: 14.25, wordBreak: 'break-word' }}>
                            {session.sessionUuid}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {session.authMethod || 'Unknown auth'} · {session.ipAddress || 'No IP'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5, fontWeight: 700, wordBreak: 'break-word' }}>
                            {session.userInfo?.userName || 'Unknown user'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {[session.userInfo?.firstName, session.userInfo?.lastName].filter(Boolean).join(' ') || 'No name'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                            {session.userUuid}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5, wordBreak: 'break-word' }}>
                            {session.deviceInfo?.deviceId || 'Unknown device'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {[session.deviceInfo?.platform ? formatLabel(session.deviceInfo.platform) : null, session.deviceInfo?.appVersion ? `App ${session.deviceInfo.appVersion}` : null]
                              .filter(Boolean)
                              .join(' · ') || 'Device details unavailable'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap">
                          <StatusChip
                            label={session.isExpired ? 'Expired' : session.isActive ? 'Active' : 'Inactive'}
                            tone={session.isExpired ? 'warning' : session.isActive ? 'success' : 'default'}
                          />
                          <Chip size="small" label={formatLabel(session.platform)} variant="outlined" />
                          {session.tenantTokenStatus ? (
                            <Chip size="small" label={formatLabel(session.tenantTokenStatus)} variant="outlined" />
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                            Last {formatTimeAgo(session.lastActivity)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Created {formatTimeAgo(session.createdAt)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                            {formatExpiryLabel(session.timeUntilExpiry, session.isExpired)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {session.expiresAt ? formatDateTime(session.expiresAt) : 'No expiry timestamp'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                            {session.apiCallsCount} API calls
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {session.tenantTokenRefreshCount || session.refreshCount} refreshes · {session.tenantApiCallsCount} tenant calls
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {session.ipAddress || 'No IP'} · {formatLabel(session.authMethod)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(event) => openMenu(event, session)} aria-label="Session actions">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Page {pageIndex + 1}
          {pagination ? ` · ${pagination.totalReturned} returned` : ''}
          {pagination?.hasMore ? '' : ' · End of list'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={pager.goPrevious} disabled={!pager.hasPrevious || query.isFetching}>
            Previous
          </Button>
          <Button
            size="small"
            onClick={() => pager.goNext(pagination?.nextCursor ?? null)}
            disabled={!pagination?.hasMore || !pagination?.nextCursor || query.isFetching}
          >
            Next
          </Button>
        </Stack>
      </Stack>

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            openRevokeDialog();
          }}
          disabled={!menuSession}
        >
          <DeleteOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
          Revoke session
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(revokeTarget)} onClose={() => setRevokeTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Revoke session</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity="warning" variant="outlined">
              This will end the selected session and remove its access token immediately.
            </Alert>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Session
              </Typography>
              <Typography sx={{ fontWeight: 800, wordBreak: 'break-word' }}>
                {revokeTarget?.sessionUuid || 'Unknown session'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {revokeTarget?.userInfo?.userName || 'Unknown user'} · {revokeTarget?.platform || 'Unknown platform'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)} disabled={isRevoking}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleRevoke()} disabled={isRevoking}>
            {isRevoking ? 'Revoking...' : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default function TenantDetailsPage() {
  const { tenantUuid = 'ten_01' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const initialTab = tabParamMap[searchParams.get('tab') ?? 'overview'] ?? 0;
  const [tab, setTab] = useState(initialTab);
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetTargetKey, setResetTargetKey] = useState<string | null>(null);
  const [sessionUserUuidFilter, setSessionUserUuidFilter] = useState('');
  const [form, setForm] = useState<SettingFormState>(emptyFormState);
  const [touched, setTouched] = useState<FormTouched>(createEmptyTouched());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Banner>(null);
  const shouldLoadAppSettings = tab === tabParamMap['app-settings'];

  const tenantQuery = useTenantQuery(tenantUuid);
  const settingsQuery = useTenantAppSettingsQuery(tenantUuid, shouldLoadAppSettings);

  useEffect(() => {
    const nextTab = tabParamMap[searchParams.get('tab') ?? 'overview'] ?? 0;
    setTab(nextTab);
  }, [searchParams]);

  const tenant = tenantQuery.data ?? null;
  const settingsResult = settingsQuery.data ?? null;
  const settings = settingsResult?.settings ?? [];
  const settingsTotalCount = settingsResult?.totalCount ?? settings.length;
  const settingsRetrievedAt = settingsResult?.retrievedAt ?? null;
  const switchTab = (nextTab: number) => {
    setTab(nextTab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabIndexMap[nextTab]);
    setSearchParams(next, { replace: true });
  };
  const editingSetting = useMemo(
    () => settings.find((setting) => setting.settingKey === editingSettingKey) ?? null,
    [editingSettingKey, settings],
  );
  const isTenantLoading = tenantQuery.isPending && !tenant && !tenantQuery.isError;
  const isSettingsLoading = settingsQuery.isPending && !settingsQuery.data && !settingsQuery.isError;
  const hasTenantData = Boolean(tenant);
  const shouldShowTenantError = tenantQuery.isError && !hasTenantData;

  const metrics = useMemo(
    () => [
      { label: 'Users', value: tenant?.totalUsers ?? 0 },
      { label: 'Active sessions', value: tenant?.totalActiveSessions ?? 0 },
      { label: 'App settings', value: settingsTotalCount },
      { label: 'Status', value: tenant?.isActive ? 'Active' : 'Inactive' },
    ],
    [settingsTotalCount, tenant],
  );

  const fieldErrors = useMemo(() => {
    const nextErrors = createEmptyFieldErrors();
    nextErrors.settingValue = validateSettingValue(form.settingType, form.settingValue);
    return nextErrors;
  }, [editingSettingKey, form]);

  const canSave = Object.values(fieldErrors).every((error) => !error);

  const showFieldError = (field: keyof SettingFormState) =>
    touched[field] || submitAttempted ? fieldErrors[field] : '';

  const openEditDialog = (setting: AppSetting) => {
    setEditingSettingKey(setting.settingKey);
    setForm(toSettingFormState(setting));
    setTouched(createEmptyTouched());
    setSubmitAttempted(false);
    setFeedback(null);
    setIsDialogOpen(true);
  };

  const openResetDialog = (settingKey: string) => {
    setResetTargetKey(settingKey);
    setFeedback(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSettingKey(null);
    setTouched(createEmptyTouched());
    setSubmitAttempted(false);
  };

  const closeResetDialog = () => {
    setResetTargetKey(null);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setFeedback(null);

    if (!editingSettingKey || !canSave || isSaving) {
      setTouched({
        settingKey: false,
        settingValue: true,
        settingType: false,
        description: false,
        platform: false,
        minAppVersion: false,
        maxAppVersion: false,
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload: AppSettingInput = {
        settingValue: parseFormValue(form.settingType, form.settingValue),
        settingType: form.settingType,
      };

      await updateTenantAppSetting(tenantUuid, editingSettingKey, payload);
      setFeedback({ severity: 'success', message: `Updated setting "${editingSettingKey}".` });

      await queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid, 'app-settings'] });
      closeDialog();
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unable to save the setting.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetTargetKey) {
      return;
    }

    setFeedback(null);
    setIsSaving(true);

    try {
      await deleteTenantAppSetting(tenantUuid, resetTargetKey);
      await queryClient.invalidateQueries({ queryKey: ['tenants', tenantUuid, 'app-settings'] });
      setFeedback({ severity: 'success', message: `Restored "${resetTargetKey}" to its tenant baseline.` });
      closeResetDialog();
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unable to reset the setting.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isTenantLoading) {
    return <LoadingState label="Loading tenant details..." />;
  }

  if (shouldShowTenantError) {
    return (
      <ErrorState
        title="Tenant details unavailable"
        description="The tenant detail endpoint could not be loaded. Retry once the backend is reachable."
        onRetry={() => void tenantQuery.refetch()}
      />
    );
  }

  if (!tenant) {
    return (
      <ErrorState
        title="Tenant not found"
        description="The current tenant record is missing in this environment."
        onRetry={() => void tenantQuery.refetch()}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        breadcrumbs={[
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Home
          </Typography>,
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Tenants
          </Typography>,
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Tenant Details
          </Typography>,
        ]}
        title={tenant.domainName}
        subtitle="Detailed workspace view with tenant controls, rollout metadata, and reserved tabs for user and session workflows."
        chipLabel={tenant.subscriptionInfo.tier}
      />

      {isSettingsLoading ? <LinearProgress sx={{ borderRadius: 0.5, height: 3 }} /> : null}

      {feedback ? (
        <Alert severity={feedback.severity} variant="outlined">
          {feedback.message}
        </Alert>
      ) : null}

              {tenantQuery.isError && hasTenantData ? (
        <Alert severity="warning" variant="outlined">
          Current tenant data could not refresh right now. Showing the last successful view until the service recovers.
        </Alert>
      ) : null}

      {settingsQuery.isError ? (
        <Alert severity="warning" variant="outlined">
          Tenant settings are temporarily unavailable. The rest of the workspace view remains live.
        </Alert>
      ) : null}

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <StatusChip label={tenant.isActive ? 'Active' : 'Inactive'} tone={tenant.isActive ? 'success' : 'warning'} />
        <StatusChip
          label={`${tenant.totalActiveSessions} active sessions`}
          tone={tenant.totalActiveSessions > 0 ? 'info' : 'default'}
        />
        {tenant.buildUrl ? <StatusChip label={tenant.buildUrl} tone="default" /> : null}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </Box>

      <SectionCard sx={{ p: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, nextTab) => {
            switchTab(nextTab);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, pt: 1 }}
        >
          {tabLabels.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        <Box sx={{ px: 3, pb: 3 }}>
          {tab === 0 ? (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Overview
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
                }}
              >
                <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 2.25 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tenant metadata
                    </Typography>
                    <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Build URL
                        </Typography>
                        <Typography sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                          {tenant.buildUrl || 'Unknown'}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Created
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{formatDate(tenant.createdAt)}</Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Last seen
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{formatTimeAgo(tenant.lastSeenAt)}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 2.25 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Subscription
                    </Typography>
                    <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Tier
                        </Typography>
                        <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                          {tenant.subscriptionInfo.tier}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Max users
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {tenant.subscriptionInfo.maxUsers ?? 'Unlimited'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Features
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.75 }}>
                          {tenant.subscriptionInfo.features.length ? (
                            tenant.subscriptionInfo.features.map((feature) => (
                              <Chip key={feature} label={feature} size="small" variant="outlined" />
                            ))
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              No feature list provided.
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          ) : null}

          {tab === 1 ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Tenant settings
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Review, update, and restore tenant-controlled app behavior from one place.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    {settingsTotalCount} settings loaded{settingsRetrievedAt ? `, refreshed ${formatDateTime(settingsRetrievedAt)}` : ''}
                  </Typography>
                </Box>
              </Stack>

              {settingsQuery.isError && !settings.length ? (
                <ErrorState
                  title="App settings unavailable"
                  description="The live app-settings endpoint could not be loaded. Retry once the backend is reachable."
                  onRetry={() => void settingsQuery.refetch()}
                />
              ) : null}

              {!settingsQuery.isError && !settings.length && !isSettingsLoading ? (
                <EmptyState
                  title="No tenant settings yet"
                  description="This tenant has not received any centrally managed settings yet."
                />
              ) : null}

              {isSettingsLoading ? (
                <LoadingState label="Loading app settings..." />
              ) : (
                <TableContainer
                  sx={{
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    overflow: 'auto',
                    boxShadow: 'none',
                  }}
                >
                  <Table size="small" sx={{ minWidth: 1600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          Setting Key
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          Current Value
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          Original Value
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          Type
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          History
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          Updated
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                          Original Fetch
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }} align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {settings.map((setting) => (
                        <TableRow
                          key={setting.settingKey}
                          hover
                          sx={{
                            '& .MuiTableCell-root': {
                              py: 1,
                              borderBottomColor: 'rgba(16,24,40,0.06)',
                            },
                            }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 800, fontSize: 14.25, wordBreak: 'break-word' }}>
                              {setting.settingKey}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontFamily: 'IBM Plex Mono, monospace',
                              }}
                            >
                              {formatSettingValue(setting.updatedValue ?? setting.settingValue)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 13.5,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: 'text.secondary',
                                fontFamily: 'IBM Plex Mono, monospace',
                              }}
                            >
                              {formatSettingValue(setting.originalValue)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip label={setting.updatedValueType ?? setting.settingType} tone="info" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                              {setting.versionHistory?.length ? `${setting.versionHistory.length} entries` : 'None'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                              {formatDateTime(setting.lastUpdatedAt ?? null)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                              {formatDateTime(setting.lastOriginalFetch ?? null)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                              <Button size="small" startIcon={<EditIcon />} onClick={() => openEditDialog(setting)} disabled={isSaving}>
                                Edit
                              </Button>
                              {setting.isOverridden ? (
                                <Button
                                  size="small"
                                  color="error"
                                  startIcon={<DeleteOutlineIcon />}
                                  onClick={() => openResetDialog(setting.settingKey)}
                                  disabled={isSaving}
                                >
                                  Restore
                                </Button>
                              ) : null}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          ) : null}

          <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
            <UsersTabPanel
              tenantUuid={tenantUuid}
              active={tab === 2}
              onOpenSessionsForUser={(userUuid) => {
                setSessionUserUuidFilter(userUuid);
                switchTab(3);
              }}
            />
          </Box>
          <Box sx={{ display: tab === 3 ? 'block' : 'none' }}>
            <SessionsTabPanel
              tenantUuid={tenantUuid}
              active={tab === 3}
              userUuidFilter={sessionUserUuidFilter}
              onUserUuidFilterChange={setSessionUserUuidFilter}
              onNotify={setFeedback}
            />
          </Box>
          {tab === 4 ? (
            <PlaceholderPanel
              title="Audit Log"
              copy="Audit trail entries can render here when the log stream is connected."
              items={['Change history', 'Actor and timestamp', 'Export controls']}
            />
          ) : null}
        </Box>
      </SectionCard>

      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={(event) => void handleSave(event)}>
          <DialogTitle>Update tenant setting</DialogTitle>
          <DialogContent>
            <Stack spacing={1.75} sx={{ mt: 1 }}>
              <Alert severity="info" variant="outlined">
                Update the active tenant value while keeping the original baseline available for review.
              </Alert>
              {editingSetting ? (
                <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Setting
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{editingSetting.settingKey}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {editingSetting.description || 'No description provided.'}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip size="small" label={`Type: ${editingSetting.updatedValueType ?? editingSetting.settingType}`} />
                        <Chip size="small" label={editingSetting.isOverridden ? 'Overridden' : 'Synced'} variant="outlined" />
                        <Chip size="small" label={`Changes: ${editingSetting.changeCount ?? 0}`} variant="outlined" />
                      </Stack>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Baseline value
                        </Typography>
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', wordBreak: 'break-word' }}>
                          {formatSettingValue(editingSetting.originalValue)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Active value
                        </Typography>
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', wordBreak: 'break-word' }}>
                          {formatSettingValue(editingSetting.updatedValue ?? editingSetting.settingValue)}
                        </Typography>
                      </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Updated by {editingSetting.updatedByAdmin || 'unknown'} at{' '}
                        {formatDateTime(editingSetting.adminUpdatedAt ?? editingSetting.lastUpdatedAt ?? null)}.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}
              <TextField
                label="Updated Value"
                required
                value={form.settingValue}
                onChange={(event) => {
                  setForm((current) => ({ ...current, settingValue: event.target.value }));
                  setFeedback(null);
                }}
                onBlur={() => setTouched((current) => ({ ...current, settingValue: true }))}
                fullWidth
                multiline={form.settingType === 'json'}
                minRows={form.settingType === 'json' ? 4 : 1}
                error={Boolean(showFieldError('settingValue'))}
                helperText={
                  showFieldError('settingValue') ||
                  (form.settingType === 'json'
                    ? 'Provide valid JSON for the active tenant value.'
                    : form.settingType === 'boolean'
                      ? 'Use `true` or `false`.'
                      : form.settingType === 'number'
                      ? 'Use a numeric value.'
                      : 'Enter the active value to store.')
                }
                disabled={isSaving}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!canSave || isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(resetTargetKey)} onClose={closeResetDialog} fullWidth maxWidth="sm">
        <DialogTitle>Restore tenant setting</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity="warning" variant="outlined">
              Restoring this setting will remove the override and return the tenant to its baseline value.
            </Alert>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Setting
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{resetTargetKey}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResetDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleReset()} disabled={isSaving}>
            {isSaving ? 'Restoring...' : 'Restore'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
