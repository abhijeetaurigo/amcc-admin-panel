import { Alert, Button, Stack } from '@mui/material';

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again or refresh the page.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack spacing={2}>
      <Alert
        severity="error"
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          backgroundColor: 'rgba(244,67,54,0.04)',
          alignItems: 'flex-start',
          borderColor: 'rgba(244,67,54,0.18)',
        }}
      >
        <strong>{title}</strong>
        <div>{description}</div>
      </Alert>
      {onRetry ? (
        <Button variant="outlined" onClick={onRetry} sx={{ alignSelf: 'flex-start' }}>
          Retry
        </Button>
      ) : null}
    </Stack>
  );
}
