import { Box, Button, Card, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Card
      sx={{
        p: 0,
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 3.25 },
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,252,253,0.96) 100%)',
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          {icon ? (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(1, 95, 116, 0.07)',
                border: '1px solid',
                borderColor: 'rgba(1,95,116,0.10)',
                color: 'primary.main',
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 520 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
          {actionLabel ? (
            <Button variant="contained" size="small" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}
