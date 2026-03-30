import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Alert,
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem as MuiMenuItem,
  LinearProgress,
  ListItemIcon,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SearchFilterBar,
  StatusChip,
} from '../components';
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

export default function TenantManagementPage() {
  const navigate = useNavigate();
  const tenantsQuery = useTenantsQuery();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [tier, setTier] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTenant, setMenuTenant] = useState<Tenant | null>(null);

  const tenants = tenantsQuery.data?.tenants ?? [];
  const isInitialLoading = tenantsQuery.isPending && !tenants.length;
  const isRefreshing = tenantsQuery.isFetching && tenants.length > 0;
  const isError = tenantsQuery.isError;
  const hasFilters = Boolean(query.trim()) || status !== 'all' || tier !== 'all';

  const filteredTenants = useMemo(
    () =>
      tenants.filter((tenant) => {
        const matchesQuery =
          tenant.domainName.toLowerCase().includes(query.toLowerCase()) ||
          tenant.buildUrl.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          status === 'all' || (status === 'active' ? tenant.isActive : !tenant.isActive);
        const matchesTier = tier === 'all' || tenant.subscriptionInfo.tier === tier;
        return matchesQuery && matchesStatus && matchesTier;
      }),
    [query, status, tenants, tier],
  );

  const filterControls: ReactNode = (
    <>
      <TextField
        select
        size="small"
        label="Status"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        sx={{ minWidth: 128 }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Tier"
        value={tier}
        onChange={(event) => setTier(event.target.value)}
        sx={{ minWidth: 136 }}
      >
        <MenuItem value="all">All Tiers</MenuItem>
        <MenuItem value="standard">Standard</MenuItem>
        <MenuItem value="premium">Premium</MenuItem>
        <MenuItem value="trial">Trial</MenuItem>
      </TextField>
    </>
  );

  const openTenantMenu = (event: React.MouseEvent<HTMLButtonElement>, tenant: Tenant) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTenant(tenant);
  };

  const closeTenantMenu = () => {
    setMenuAnchorEl(null);
    setMenuTenant(null);
  };

  const handleOpenTenantUsers = () => {
    if (menuTenant) {
      navigate(`/tenants/${menuTenant.tenantUuid}?tab=users`);
    }
    closeTenantMenu();
  };

  const handleOpenTenantAppSettings = () => {
    if (menuTenant) {
      navigate(`/tenants/${menuTenant.tenantUuid}?tab=app-settings`);
    }
    closeTenantMenu();
  };

  const handleOpenTenantDetails = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.tenantUuid}?tab=overview`);
  };

  const handleResetFilters = () => {
    setQuery('');
    setStatus('all');
    setTier('all');
  };

  const toolbarSummary = isInitialLoading
    ? 'Loading live tenants...'
    : `${filteredTenants.length} of ${tenants.length} tenants`;
  const shouldShowTable = isInitialLoading || filteredTenants.length > 0;
  const shouldShowEmptyState = !isInitialLoading && filteredTenants.length === 0 && !(isError && !tenants.length);

  return (
    <Stack spacing={2.5}>
      <PageHeader
        breadcrumbs={[
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Home
          </Typography>,
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Tenants
          </Typography>,
        ]}
        title="Tenant Management"
        subtitle="Search, filter, and manage tenant workspaces from one central control surface."
        actions={[
          {
            label: 'Refresh',
            onClick: () => void tenantsQuery.refetch(),
          },
        ]}
      />

      <SearchFilterBar
        searchValue={query}
        searchPlaceholder="Search by domain or build URL"
        onSearchChange={setQuery}
        filters={filterControls}
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              {toolbarSummary}
            </Typography>
            {hasFilters ? (
              <Button variant="text" onClick={handleResetFilters} sx={{ minWidth: 96, borderRadius: 1 }}>
                Reset
              </Button>
            ) : null}
          </Stack>
        }
      />

      {isInitialLoading || isRefreshing ? (
        <LinearProgress sx={{ borderRadius: 0.5, height: 3 }} />
      ) : null}

      {isError && !tenants.length ? (
        <ErrorState
          title="Live tenant data is unavailable"
          description="The tenant list could not be loaded from the live API. Retry once the backend is reachable."
          onRetry={() => void tenantsQuery.refetch()}
        />
      ) : null}

      {isError && tenants.length ? (
        <Alert severity="warning" variant="outlined">
          Live tenant data could not refresh right now. Showing the last successful snapshot until the API recovers.
        </Alert>
      ) : null}

      {shouldShowEmptyState ? (
        <EmptyState
          title={hasFilters ? 'No tenants match these filters' : 'No tenants available'}
          description={
            hasFilters
              ? 'Try broadening the search or resetting your filters.'
              : 'There are no tenant workspaces in this environment yet.'
          }
          actionLabel={hasFilters ? 'Reset filters' : undefined}
          onAction={hasFilters ? handleResetFilters : undefined}
        />
      ) : shouldShowTable ? (
        <TableContainer
          sx={{
            borderRadius: 1.25,
            backgroundColor: 'background.paper',
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Table size="small" sx={{ minWidth: 1040 }}>
            <TableHead>
              <TableRow>
                  <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                  Domain Name
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                  Build URL
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                  Created
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                  Last Seen
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }} align="right">
                  Users
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }} align="right">
                  Sessions
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                  Tier
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }}>
                  Status
                </TableCell>
                <TableCell sx={{ py: 1, fontSize: 12.5, fontWeight: 800, color: 'text.secondary' }} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isInitialLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow
                      key={`tenant-skeleton-${index}`}
                      sx={{
                        '& .MuiTableCell-root': {
                          py: 1,
                          borderBottomColor: 'rgba(16,24,40,0.06)',
                        },
                      }}
                    >
                      <TableCell colSpan={9}>
                        <Stack spacing={0.75}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Loading tenant record...
                          </Typography>
                          <LinearProgress sx={{ borderRadius: 0.5 }} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                : filteredTenants.map((tenant) => (
                <TableRow
                  key={tenant.tenantUuid}
                  hover
                  onClick={() => handleOpenTenantDetails(tenant)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenTenantDetails(tenant);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  sx={{
                    cursor: 'pointer',
                    '& .MuiTableCell-root': {
                      py: 0.9,
                      borderBottomColor: 'rgba(16,24,40,0.06)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                    },
                  }}
                >
                  <TableCell>
                    <Stack spacing={0.15}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14.25, lineHeight: 1.2 }}>
                        {tenant.domainName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
                        {tenant.tenantUuid}
                      </Typography>
                    </Stack>
                  </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                    <Link
                      href={tenant.buildUrl}
                      target="_blank"
                      rel="noreferrer"
                      underline="hover"
                      color="primary"
                      onClick={(event) => event.stopPropagation()}
                      sx={{
                        display: 'inline-block',
                        maxWidth: 250,
                        fontSize: 13.5,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tenant.buildUrl}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                      {formatDate(tenant.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                      {formatTimeAgo(tenant.lastSeenAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                      {tenant.totalUsers}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                      {tenant.totalActiveSessions}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', fontSize: 13.5 }}>
                      {tenant.subscriptionInfo.tier}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={tenant.isActive ? 'Active' : 'Inactive'}
                      tone={tenant.isActive ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label={`Open actions for ${tenant.domainName}`}
                      aria-haspopup="menu"
                      aria-controls={
                        menuTenant?.tenantUuid === tenant.tenantUuid ? 'tenant-actions-menu' : undefined
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        openTenantMenu(event, tenant);
                      }}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 0.75,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Menu
        id="tenant-actions-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeTenantMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ dense: true }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: 1.25,
            minWidth: 176,
            boxShadow: '0 12px 30px rgba(16, 24, 40, 0.12)',
          },
        }}
      >
        <MuiMenuItem dense onClick={handleOpenTenantUsers}>
          <ListItemIcon>
            <GroupsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Users
        </MuiMenuItem>
        <MuiMenuItem dense onClick={handleOpenTenantAppSettings}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          App Settings
        </MuiMenuItem>
      </Menu>
    </Stack>
  );
}
