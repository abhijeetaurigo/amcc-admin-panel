export interface ApiErrorPayload {
  error?: string;
  message?: string;
  details?: unknown;
}

export interface ApiListResponse<T> {
  items?: T[];
  data?: T[];
  results?: T[];
  tenants?: T[];
  settings?: T[];
  app_settings?: T[];
  total_count?: number;
  totalCount?: number;
  count?: number;
}

export interface ApiSingleResponse<T> {
  data?: T;
  item?: T;
  result?: T;
}

export interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  success?: boolean;
}
