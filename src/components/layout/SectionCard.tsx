import { Card, CardContent, type CardProps } from '@mui/material';
import type { ReactNode } from 'react';

export type SectionCardProps = CardProps & {
  children: ReactNode;
  inset?: boolean;
};

export function SectionCard({ children, inset = true, sx, ...rest }: SectionCardProps) {
  return (
    <Card
      {...rest}
      sx={[
        {
          overflow: 'hidden',
          backgroundImage: 'none',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CardContent sx={inset ? undefined : { p: 0 }}>{children}</CardContent>
    </Card>
  );
}
