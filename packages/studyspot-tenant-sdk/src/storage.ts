const PREFIX = 'studyspot_sdk';

export interface StorageAdapter {
  getItem<T = unknown>(key: string): T | null;
  setItem<T = unknown>(key: string, value: T): void;
  removeItem(key: string): void;
  clear?(): void;
}

export class BrowserStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: Storage = window.localStorage) {}

  getItem<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(`${PREFIX}:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      console.warn('[StudySpot SDK] Failed to read storage key', key, error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      this.storage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('[StudySpot SDK] Failed to persist storage key', key, error);
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(`${PREFIX}:${key}`);
    } catch (error) {
      console.warn('[StudySpot SDK] Failed to remove storage key', key, error);
    }
  }

  clear(): void {
    try {
      Object.keys(this.storage)
        .filter((key) => key.startsWith(`${PREFIX}:`))
        .forEach((key) => this.storage.removeItem(key));
    } catch (error) {
      console.warn('[StudySpot SDK] Failed to clear storage', error);
    }
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  private data = new Map<string, unknown>();

  getItem<T>(key: string): T | null {
    if (!this.data.has(key)) return null;
    return this.data.get(key) as T;
  }

  setItem<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

export interface TokenStorageSchema {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  tenantId?: string;
}

const TOKEN_KEY = 'tokens';

export class TokenStorage {
  constructor(private readonly adapter: StorageAdapter) {}

  read(): TokenStorageSchema | null {
    return this.adapter.getItem<TokenStorageSchema>(TOKEN_KEY);
  }

  write(payload: TokenStorageSchema): void {
    this.adapter.setItem<TokenStorageSchema>(TOKEN_KEY, payload);
  }

  clear(): void {
    this.adapter.removeItem(TOKEN_KEY);
  }
}

