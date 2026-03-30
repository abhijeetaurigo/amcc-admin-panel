const hasStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function getStorage(): Storage | null {
  return hasStorage ? window.localStorage : null;
}

export function readStoredValue(key: string): string | null {
  return getStorage()?.getItem(key) ?? null;
}

export function writeStoredValue(key: string, value: string): void {
  getStorage()?.setItem(key, value);
}

export function removeStoredValue(key: string): void {
  getStorage()?.removeItem(key);
}

export function readStoredJson<T>(key: string): T | null {
  const raw = readStoredValue(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown): void {
  writeStoredValue(key, JSON.stringify(value));
}
