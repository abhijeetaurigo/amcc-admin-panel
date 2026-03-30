const defaultApiBaseUrl = 'https://7g4v6419uk.execute-api.us-east-1.amazonaws.com';

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL?.trim() || defaultApiBaseUrl;
}

export function getAppName(): string {
  return import.meta.env.VITE_APP_NAME?.trim() || 'Aurigo Mobile Control Panel';
}

export function getAppVersion(): string {
  return import.meta.env.VITE_APP_VERSION?.trim() || '1.0.0';
}
