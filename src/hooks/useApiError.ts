import { useMemo } from 'react';
import { getApiErrorMessage, isUnauthorizedError } from '@/lib/api-error';

export function useApiError(error: unknown, fallback?: string) {
  return useMemo(
    () => ({
      message: getApiErrorMessage(error, fallback),
      isUnauthorized: isUnauthorizedError(error),
    }),
    [error, fallback],
  );
}
