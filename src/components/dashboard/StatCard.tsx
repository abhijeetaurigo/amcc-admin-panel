import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
  delta?: string;
  icon?: ReactNode;
  accent?: string;
};

export function StatCard({ label, value, helperText, delta, icon, accent = '#015F74' }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2.1 }}>
        <Stack spacing={1.35}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                {label}
              </Typography>
              <Typography
                variant="h3"
                sx={{ mt: 0.5, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.03em' }}
              >
                {value}
              </Typography>
            </Box>
            {icon ? (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: accent,
                  backgroundColor: 'rgba(1, 95, 116, 0.05)',
                  border: '1px solid',
                  borderColor: 'rgba(1, 95, 116, 0.07)',
                  '& svg': {
                    fontSize: 20,
                  },
                }}
              >
                {icon}
              </Box>
            ) : null}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {delta ? (
              <Typography variant="body2" fontWeight={800} color={accent} sx={{ fontSize: 13 }}>
                {delta}
              </Typography>
            ) : null}
            {helperText ? (
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, fontSize: 13 }}>
                {helperText}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
