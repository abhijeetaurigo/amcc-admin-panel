import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EmptyState, PageHeader, SectionCard, StatCard, StatusChip } from '../components';
import { useTenantsQuery } from '../hooks';
import type { Tenant } from '../types/tenant';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Unknown';
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

function sortByRecentActivity(tenants: Tenant[]) {
  return [...tenants].sort((left, right) => {
    const leftTime = left.lastSeenAt ? Date.parse(left.lastSeenAt) : 0;
    const rightTime = right.lastSeenAt ? Date.parse(right.lastSeenAt) : 0;
    return rightTime - leftTime;
  });
}

function LoadingRows() {
  return (
    <Stack spacing={1.5} sx={{ mt: 2 }}>
      {[0, 1, 2].map((index) => (
        <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 1.5 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box>
            <Skeleton variant="text" width="72%" height={24} />
            <Skeleton variant="text" width="48%" height={20} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const tenantsQuery = useTenantsQuery();
  const tenants = tenantsQuery.data?.tenants ?? [];
  const isInitialLoading = tenantsQuery.isPending && tenants.length === 0;
  const isRefreshing = tenantsQuery.isFetching && !isInitialLoading;
  const hasError = tenantsQuery.isError;
  const sortedTenants = sortByRecentActivity(tenants);
  const activeTenants = tenants.filter((tenant) => tenant.isActive);
  const inactiveTenants = tenants.filter((tenant) => !tenant.isActive);
  const totalUsers = tenants.reduce((sum, tenant) => sum + tenant.totalUsers, 0);
  const totalSessions = tenants.reduce((sum, tenant) => sum + tenant.totalActiveSessions, 0);
  const recentTenants = sortedTenants.slice(0, 4);
  const focusTenants = sortedTenants.slice(0, 3);

  const statValue = (value: number) => (isInitialLoading || (hasError && !tenants.length) ? '—' : value);
  const statHelper = hasError
    ? 'Current state unavailable'
    : isInitialLoading
      ? 'Loading current state'
      : 'Current tenant inventory';
  const operatorStatus = hasError ? 'Attention needed' : isRefreshing ? 'Refreshing control view' : 'Control view live';

  return (
    <Stack spacing={2.5}>
      <PageHeader
        breadcrumbs={[
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Home
          </Typography>,
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Dashboard
          </Typography>,
        ]}
        title="Central Control Plane"
        subtitle="Monitor tenant health, review configuration changes, and open the workspaces that need attention."
        chipLabel={operatorStatus}
        actions={[
          {
            label: 'Review tenants',
            onClick: () => navigate('/tenants'),
          },
        ]}
      />

      {isRefreshing ? <LinearProgress sx={{ borderRadius: 0.5 }} /> : null}

      {hasError ? (
        <Alert severity="warning" variant="outlined">
          Current tenant data is temporarily unavailable. Refresh once the service is reachable.
        </Alert>
      ) : null}

      <SectionCard
        sx={{
          background:
            'linear-gradient(135deg, rgba(1,95,116,0.96) 0%, rgba(11,59,63,0.95) 58%, rgba(24,32,48,0.94) 100%)',
          color: 'common.white',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2.5}
          alignItems={{ lg: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ maxWidth: 680 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.78)', letterSpacing: 1.8 }}>
              Control center
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25, lineHeight: 1.15 }}>
              One place to see tenant health and push app changes with confidence.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', mt: 0.9, lineHeight: 1.65 }}>
              Use this view to spot workspaces that need attention, drill into the right tenant, and
              adjust behavior from a single control surface.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <StatusChip label={`${activeTenants.length} active`} tone="info" />
              <StatusChip label={`${inactiveTenants.length} needing review`} tone={inactiveTenants.length ? 'warning' : 'success'} />
              <StatusChip label={`${recentTenants.length} recent check-ins`} tone="default" />
            </Stack>
          </Box>

          <Box
            sx={{
              minWidth: { xs: '100%', lg: 280 },
              p: 2,
              borderRadius: 1.25,
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>
              Operator action
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.25 }}>
              Review the workspaces that need attention.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75, lineHeight: 1.55 }}>
              Start with the tenant list, then open app settings for the workspace you want to adjust.
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/tenants')}
                sx={{
                  backgroundColor: '#fff',
                  color: '#015F74',
                  '&:hover': { backgroundColor: '#eff8fa' },
                }}
              >
                Review tenants
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/tenants')}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.35)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.6)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                Open control details
              </Button>
            </Stack>
          </Box>
        </Stack>
      </SectionCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.25,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
        }}
      >
        <StatCard
          label="Total Tenants"
          value={statValue(tenants.length)}
          helperText={statHelper}
          delta={`${activeTenants.length} active`}
          icon={<ApartmentOutlinedIcon />}
        />
        <StatCard
          label="Active Users"
          value={statValue(totalUsers)}
          helperText={isInitialLoading ? 'Summing current records' : 'Summed from tenant records'}
          delta={`Across ${tenants.length || 0} workspaces`}
          icon={<GroupsOutlinedIcon />}
        />
        <StatCard
          label="Active Sessions"
          value={statValue(totalSessions)}
          helperText={isInitialLoading ? 'Loading activity' : 'Current session activity'}
          delta={`${Math.round((activeTenants.length / Math.max(tenants.length, 1)) * 100)}% of tenants healthy`}
          icon={<CloudDoneOutlinedIcon />}
        />
        <StatCard
          label="Open Actions"
          value={statValue(recentTenants.length)}
          helperText={isInitialLoading ? 'Waiting for current view' : 'Recent changes to review'}
          delta={hasError ? 'View unavailable' : 'Current view'}
          icon={<ArticleOutlinedIcon />}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', xl: '1.15fr 0.85fr' },
        }}
      >
        <SectionCard>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent activity
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Latest check-ins from the most active workspaces.
              </Typography>
            </Box>
            <StatusChip
              label={hasError ? 'Unavailable' : isRefreshing ? 'Refreshing' : 'Live'}
              tone={hasError ? 'warning' : 'info'}
            />
          </Stack>

          {isInitialLoading ? (
            <LoadingRows />
          ) : recentTenants.length ? (
            <List sx={{ mt: 0.75 }}>
              {recentTenants.map((tenant, index) => (
                <Box key={tenant.tenantUuid}>
                  <ListItem sx={{ px: 0, py: 1.1, alignItems: 'flex-start' }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        mr: 1.75,
                        bgcolor: tenant.isActive ? 'rgba(1,95,116,0.12)' : 'rgba(217,119,6,0.12)',
                        color: tenant.isActive ? '#015F74' : '#b45309',
                        fontWeight: 700,
                        fontSize: 18,
                        borderRadius: 1,
                      }}
                    >
                      {tenant.domainName.slice(0, 1).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={tenant.domainName}
                      secondary={`${formatTimeAgo(tenant.lastSeenAt)} • ${tenant.totalActiveSessions} active sessions`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: 15 }}
                      secondaryTypographyProps={{ fontSize: 13.5 }}
                    />
                  </ListItem>
                  {index < recentTenants.length - 1 ? <Divider /> : null}
                </Box>
              ))}
            </List>
          ) : (
            <EmptyState
              title={hasError ? 'Recent activity unavailable' : 'No recent tenant activity'}
              description={
                hasError
                  ? 'The API did not return a live snapshot yet. Try refreshing after the backend is reachable.'
                  : 'No tenants have checked in yet.'
              }
              actionLabel="Open tenants"
              onAction={() => navigate('/tenants')}
            />
          )}
        </SectionCard>

        <SectionCard>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Tenants in focus
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Workspaces most likely to need an operator decision.
              </Typography>
            </Box>
            <StatusChip
              label={`${inactiveTenants.length} needing review`}
              tone={inactiveTenants.length ? 'warning' : 'success'}
            />
          </Stack>

          {isInitialLoading ? (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {[0, 1, 2].map((index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Skeleton variant="text" width="65%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              ))}
            </Stack>
          ) : focusTenants.length ? (
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {focusTenants.map((tenant) => (
                <Box
                  key={tenant.tenantUuid}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: '#f8fbfc',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }}>{tenant.domainName}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.35 }}>
                        {tenant.buildUrl}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.35 }}>
                        Last update {formatTimeAgo(tenant.lastSeenAt)}
                      </Typography>
                    </Box>
                    <StatusChip
                      label={tenant.isActive ? 'Active' : 'Inactive'}
                      tone={tenant.isActive ? 'success' : 'warning'}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {tenant.totalUsers} users
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Tier: {tenant.subscriptionInfo.tier}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title={hasError ? 'Tenant overview unavailable' : 'No tenants available'}
              description={
                hasError
                  ? 'The live API did not return a usable snapshot yet.'
                  : 'There are no tenant records in the current environment.'
              }
              actionLabel="Open tenants"
              onAction={() => navigate('/tenants')}
            />
          )}
        </SectionCard>
      </Box>
    </Stack>
  );
}
