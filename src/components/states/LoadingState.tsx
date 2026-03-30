import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading data...' }: LoadingStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ p: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'rgba(1,95,116,0.08)',
            border: '1px solid',
            borderColor: 'rgba(1,95,116,0.12)',
          }}
        >
          <CircularProgress size={24} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
    </Box>
  );
}
