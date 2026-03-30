import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { PageHeader, SectionCard, StatusChip } from '../components';

const logs = [
  { level: 'info', message: 'Tenant sync completed for mwmobiledevmcon.aurigo.net', time: '2 min ago' },
  { level: 'warning', message: '1 stale token expired and was cleared', time: '15 min ago' },
  { level: 'info', message: 'App settings cache refreshed', time: '42 min ago' },
  { level: 'error', message: 'Build endpoint returned 503 for a retry window', time: 'Today' },
];

export default function SystemLogsPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        breadcrumbs={
          [
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Home</Typography>,
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>System Logs</Typography>,
          ]
        }
        title="System Logs"
        subtitle="Operational event stream layout for platform health, retries, and environment-level actions."
      />

      <Stack spacing={1.5}>
        {logs.map((log) => (
          <Card key={log.message} sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{log.message}</Typography>
                  <Typography variant="body2" sx={{ color: '#60757b', mt: 0.5 }}>
                    {log.time}
                  </Typography>
                </Box>
                <StatusChip
                  label={log.level}
                  tone={log.level === 'error' ? 'error' : log.level === 'warning' ? 'warning' : 'success'}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <SectionCard sx={{ backgroundColor: '#f8fbfc' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Next integration step
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
          This route is ready for a live log table, severity filters, and export actions once the
          backend log endpoint is available.
        </Typography>
      </SectionCard>
    </Stack>
  );
}
