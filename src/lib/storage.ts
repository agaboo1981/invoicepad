const PREFIX = 'invoicepad:';

interface Versioned<T> {
  v: number;
  data: T;
}

export function loadJson<T>(
  storage: Storage,
  key: string,
  version: number,
  fallback: T,
): T {
  try {
    const raw = storage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Versioned<T>;
    if (parsed.v !== version || parsed.data === undefined) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(
  storage: Storage,
  key: string,
  version: number,
  data: T,
): void {
  storage.setItem(PREFIX + key, JSON.stringify({ v: version, data } satisfies Versioned<T>));
}

export function removeJson(storage: Storage, key: string): void {
  storage.removeItem(PREFIX + key);
}
