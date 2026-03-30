export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function firstDefined<T>(values: Array<T | undefined | null>): T | undefined {
  return values.find((value) => value !== undefined && value !== null);
}

export function readString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

export function readOptionalString(value: unknown): string | null {
  const stringValue = readString(value);
  return stringValue.length > 0 ? stringValue : null;
}

export function readBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return fallback;
}

export function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function readDateIso(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }

  return null;
}

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => readString(entry)).filter((entry) => entry.length > 0);
}

export function parseListPayload<T>(
  payload: unknown,
  parseItem: (value: unknown) => T,
  candidates: string[] = ['items', 'data', 'results'],
): { items: T[]; totalCount: number } {
  const directSource = Array.isArray(payload)
    ? payload
    : isRecord(payload)
      ? firstDefined(candidates.map((key) => payload[key]))
      : undefined;

  const nestedSource =
    Array.isArray(directSource) || !isRecord(directSource)
      ? undefined
      : firstDefined(candidates.map((key) => directSource[key]));

  const source = Array.isArray(directSource)
    ? directSource
    : Array.isArray(nestedSource)
      ? nestedSource
      : undefined;

  const items = Array.isArray(source) ? source.map(parseItem) : [];
  const totalCount = isRecord(payload)
    ? readNumber(
        firstDefined([
          payload.total_count,
          payload.totalCount,
          payload.count,
          items.length,
        ]),
        items.length,
      )
    : items.length;

  return { items, totalCount };
}

export function parseSinglePayload<T>(payload: unknown, parseItem: (value: unknown) => T): T | null {
  if (Array.isArray(payload)) {
    return payload.length > 0 ? parseItem(payload[0]) : null;
  }

  if (isRecord(payload)) {
    const source = firstDefined([
      payload.data,
      payload.item,
      payload.result,
      payload.setting_data,
      payload.setting,
      payload.app_setting,
    ]);
    if (source !== undefined) {
      return parseItem(source);
    }
  }

  return payload === undefined || payload === null ? null : parseItem(payload);
}
