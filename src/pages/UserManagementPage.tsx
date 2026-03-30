import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { PageHeader, SectionCard } from '../components';

export default function UserManagementPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        breadcrumbs={
          [
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Home</Typography>,
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>User Management</Typography>,
          ]
        }
        title="User Management"
        subtitle="Reserved for user directory controls, role assignment, and tenant-level access policies."
      />

      <Alert severity="info">
        This route is ready to receive the live user API when it is available.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        }}
      >
        <SectionCard>
          <GroupsOutlinedIcon sx={{ color: '#015F74' }} />
          <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 800 }}>
            Directory & membership
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            Add tenant-level user listings, membership mapping, and search-driven profile access.
          </Typography>
        </SectionCard>
        <SectionCard>
          <SecurityOutlinedIcon sx={{ color: '#015F74' }} />
          <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 800 }}>
            Roles & permissions
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            Extend this page with role grants, privilege boundaries, and administrative policy controls.
          </Typography>
        </SectionCard>
      </Box>
    </Stack>
  );
}
