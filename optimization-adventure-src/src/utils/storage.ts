const STORAGE_PREFIX = 'optimization-adventure'

export function storageKey(name: string): string {
  return `${STORAGE_PREFIX}:${name}`
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = storageKey('__test__')
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(storageKey(key))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(storageKey(key))
  } catch {
    // ignore
  }
}
