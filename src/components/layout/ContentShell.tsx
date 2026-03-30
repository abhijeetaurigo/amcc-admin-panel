import { Box, type BoxProps } from '@mui/material';
import type { ReactNode } from 'react';

export type ContentShellProps = BoxProps & {
  children: ReactNode;
  maxWidth?: number | string;
};

export function ContentShell({
  children,
  maxWidth = 1440,
  sx,
  ...rest
}: ContentShellProps) {
  const mergedSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Box
      {...rest}
      sx={[
        {
          width: '100%',
          maxWidth,
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2.5, sm: 3, lg: 4 },
        },
        ...mergedSx,
      ]}
    >
      {children}
    </Box>
  );
}
