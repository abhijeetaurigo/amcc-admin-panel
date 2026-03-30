import type { AxiosError } from 'axios';
import { isRecord, readString } from './parsers';

export function getApiErrorMessage(error: unknown, fallback = 'An unexpected error occurred.'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (isAxiosErrorLike(error)) {
    const responseData = error.response?.data;
    if (isRecord(responseData)) {
      return readString(responseData.message ?? responseData.error, fallback);
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosErrorLike(error) && error.response?.status === 401;
}

function isAxiosErrorLike(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
