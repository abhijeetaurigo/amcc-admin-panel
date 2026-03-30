import { Chip } from '@mui/material';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'default';

export type StatusChipProps = {
  label: string;
  tone?: StatusTone;
};

const toneMap: Record<StatusTone, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  default: 'default',
};

export function StatusChip({ label, tone = 'default' }: StatusChipProps) {
  return (
    <Chip
      label={label}
      color={toneMap[tone]}
      size="small"
      variant={tone === 'default' ? 'outlined' : 'filled'}
      sx={{
        fontWeight: 800,
        letterSpacing: '0.01em',
        ...(tone === 'default'
          ? {
              backgroundColor: 'background.paper',
              borderColor: 'divider',
            }
          : {
              boxShadow: 'none',
            }),
      }}
    />
  );
}
