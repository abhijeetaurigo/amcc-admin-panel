import { Box, Breadcrumbs, Button, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type PageHeaderAction = {
  label: string;
  onClick?: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  startIcon?: ReactNode;
  disabled?: boolean;
};

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode[];
  actions?: PageHeaderAction[];
  chipLabel?: string;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  actions = [],
  chipLabel,
}: PageHeaderProps) {
  return (
    <Stack spacing={1.5}>
      {breadcrumbs ? (
        <Breadcrumbs
          separator={
            <Typography
              component="span"
              variant="caption"
              sx={{ color: 'text.disabled', mx: 0 }}
            >
              &gt;
            </Typography>
          }
          sx={{
            color: 'text.secondary',
            fontSize: 13,
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.125,
            },
            '& .MuiBreadcrumbs-separator': {
              mx: 0.5,
              my: 0,
            },
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Box key={index} component="span">
              {crumb}
            </Box>
          ))}
        </Breadcrumbs>
      ) : null}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        gap={2}
      >
        <Box sx={{ maxWidth: 960 }}>
          {eyebrow ? (
            <Chip
              label={eyebrow}
              size="small"
              sx={{
                mb: 1,
                px: 0.5,
                backgroundColor: 'rgba(1,95,116,0.10)',
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '0.12em',
              }}
            />
          ) : null}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="h4" component="h1" sx={{ maxWidth: '100%', lineHeight: 1.08 }}>
              {title}
            </Typography>
            {chipLabel ? (
              <Chip
                label={chipLabel}
                color="primary"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            ) : null}
          </Stack>
          {subtitle ? (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860, mt: 0.75, lineHeight: 1.65 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {actions.length ? (
          <Stack direction="row" gap={1.25} flexWrap="wrap" justifyContent={{ xs: 'stretch', md: 'flex-end' }}>
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? 'contained'}
                color={action.color ?? 'primary'}
                onClick={action.onClick}
                disabled={action.disabled}
                startIcon={action.startIcon}
                sx={
                  action.variant === 'outlined'
                    ? {
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                      }
                    : undefined
                }
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
}
