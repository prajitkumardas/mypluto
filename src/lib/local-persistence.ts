export type VersionedRecord<T> = {
  version: number;
  updatedAt: string;
  data: T;
};

export function readLocalRecord<T>(key: string, version: number): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw) as Partial<VersionedRecord<T>>;
    if (record.version !== version || record.data == null) {
      window.localStorage.removeItem(key);
      return null;
    }
    return record.data;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function writeLocalRecord<T>(key: string, version: number, data: T) {
  try {
    const record: VersionedRecord<T> = { version, updatedAt: new Date().toISOString(), data };
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Storage can be unavailable in private modes. The active flow still works in memory.
  }
}

export function removeLocalRecord(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
