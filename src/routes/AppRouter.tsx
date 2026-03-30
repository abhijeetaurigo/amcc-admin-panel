import { Suspense, lazy, useState, type ReactElement } from 'react';
import {
  Route,
  Navigate,
  NavLink,
  Outlet,
  BrowserRouter,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { alpha } from '@mui/material/styles';
import { ProtectedRoute, GuestRoute } from '../auth/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { getAppName, getAppVersion } from '../lib/env';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const TenantManagementPage = lazy(() => import('../pages/TenantManagementPage'));
const TenantDetailsPage = lazy(() => import('../pages/TenantDetailsPage'));
const SystemLogsPage = lazy(() => import('../pages/SystemLogsPage'));
const UserManagementPage = lazy(() => import('../pages/UserManagementPage'));

const drawerWidth = 280;

type NavItem = {
  label: string;
  to: string;
  icon: ReactElement;
};

type NavGroup = {
  label: string;
  items: NavItem[];
  muted?: boolean;
};

const navGroups: NavGroup[] = [
  {
    label: 'Core control',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlinedIcon /> },
      { label: 'Tenants', to: '/tenants', icon: <ApartmentOutlinedIcon /> },
    ],
  },
  {
    label: 'Reserved',
    muted: true,
    items: [
      { label: 'Users', to: '/users', icon: <PeopleAltOutlinedIcon /> },
      { label: 'System Logs', to: '/system-logs', icon: <SummarizeOutlinedIcon /> },
    ],
  },
];

function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'text.primary',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(1,95,116,0.03)',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.contrastText',
              background:
                'linear-gradient(135deg, rgba(11,59,63,1) 0%, rgba(1,95,116,1) 72%, rgba(41,126,200,1) 100%)',
              boxShadow: '0 10px 24px rgba(1,95,116,0.18)',
            }}
          >
              <CheckCircleRoundedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.8 }}>
              Central control
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: 14.5 }}>
              {getAppName()}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, maxWidth: 220, lineHeight: 1.55 }}>
          Multi-tenant governance, rollout oversight, and centralized app control.
        </Typography>
      </Box>
      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 1.25 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                display: 'block',
                color: 'text.secondary',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                fontWeight: 700,
                opacity: group.muted ? 0.72 : 1,
              }}
            >
              {group.label}
            </Typography>
            <Stack spacing={0.25} sx={{ mt: 0.5 }}>
              {group.items.map((item) => (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    minHeight: 40,
                    borderRadius: 0.75,
                    color: group.muted ? 'text.secondary' : 'text.secondary',
                    border: '1px solid transparent',
                    transition: 'all 160ms ease',
                    opacity: group.muted ? 0.78 : 1,
                    '&.active': {
                      color: 'primary.main',
                      backgroundColor: alpha('#015F74', group.muted ? 0.05 : 0.08),
                      borderColor: alpha('#015F74', group.muted ? 0.08 : 0.12),
                      boxShadow: group.muted ? 'none' : '0 8px 18px rgba(1,95,116,0.08)',
                    },
                    '&:hover': {
                      backgroundColor: alpha('#015F74', group.muted ? 0.03 : 0.05),
                      borderColor: alpha('#015F74', group.muted ? 0.06 : 0.10),
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40, opacity: group.muted ? 0.78 : 1 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: group.muted ? 600 : 700, fontSize: 14.5 }}
                  />
                </ListItemButton>
              ))}
            </Stack>
          </Box>
        ))}
      </List>
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <Box
          sx={{
            p: 1.25,
            borderRadius: 0.75,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Signed in as
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.35 }}>
            {session?.admin.name || session?.admin.email || 'super_admin'}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Chip label={session?.admin.role ?? 'admin'} size="small" variant="outlined" />
            <Chip label={`v${getAppVersion()}`} size="small" variant="outlined" />
          </Stack>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{ mt: 1.1, justifyContent: 'flex-start' }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(1,95,116,0.10), transparent 32%), linear-gradient(180deg, #f7fbfc 0%, #eef3f7 100%)',
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ display: { xs: 'none', md: 'block' }, width: drawerWidth, flexShrink: 0 }}>
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: '1px solid rgba(220, 233, 254, 0.9)',
                backgroundColor: 'transparent',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Box sx={{ width: drawerWidth }}>{drawerContent}</Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 1.1, md: 1.75 },
            py: { xs: 1.1, md: 1.5 },
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.75,
              backgroundColor: 'background.paper',
              color: 'primary.main',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function RouteFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'radial-gradient(circle at top left, rgba(1,95,116,0.10), transparent 32%), linear-gradient(180deg, #f7fbfc 0%, #eef3f7 100%)',
      }}
    >
      <Box
        sx={{
          width: 'min(460px, 100%)',
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 20px 48px rgba(3, 42, 48, 0.10)',
        }}
      >
        <Stack spacing={1.75}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.contrastText',
                background:
                  'linear-gradient(135deg, rgba(11,59,63,1) 0%, rgba(1,95,116,1) 72%, rgba(41,126,200,1) 100%)',
              }}
            >
              <CheckCircleRoundedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {getAppName()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Loading central control panel
              </Typography>
            </Box>
          </Stack>
          <LinearProgress sx={{ width: '100%', borderRadius: 999, height: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Preparing tenant governance, app settings, and operational views.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute redirectTo="/dashboard">
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantManagementPage />} />
            <Route path="/tenants/:tenantUuid" element={<TenantDetailsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/system-logs" element={<SystemLogsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
