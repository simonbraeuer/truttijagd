import { Injectable } from '@angular/core';
import type { ScoreEntry, ScoreStats } from '../components/scoreboard/scoreboard';
import type { DifficultyLevel } from '../components/start-screen/start-screen';

interface ScoreboardRecord {
  id: string;
  entries: ScoreEntry[];
}

@Injectable({ providedIn: 'root' })
export class ScoreboardService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private readonly dbName = 'truttihunt-stats';
  private readonly storeName = 'scoreboard';
  private readonly recordKey = 'highscores';
  private readonly legacyStorageKey = 'truttihunt-scoreboard';

  async getScoreboard(): Promise<ScoreEntry[]> {
    const db = await this.openDb();
    if (!db) {
      return this.readLegacyScoreboard();
    }

    const entries = await this.readFromDb(db);
    if (entries.length === 0) {
      const migrated = this.readLegacyScoreboard();
      if (migrated.length > 0) {
        await this.writeToDb(db, migrated);
        this.clearLegacyScoreboard();
      }
      return migrated;
    }

    return entries;
  }

  async saveScoreboard(entries: ScoreEntry[]): Promise<void> {
    const normalized = this.normalizeScoreboard(entries);
    const db = await this.openDb();
    if (!db) {
      this.saveToLocalStorage(normalized);
      return;
    }

    await this.writeToDb(db, normalized);
  }

  private async openDb(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined' || indexedDB === null) {
      return null;
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    }

    return this.dbPromise;
  }

  private async readFromDb(db: IDBDatabase): Promise<ScoreEntry[]> {
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    const record = await this.requestToPromise<ScoreboardRecord | undefined>(store.get(this.recordKey));
    return this.normalizeScoreboard(record?.entries ?? []);
  }

  private async writeToDb(db: IDBDatabase, entries: ScoreEntry[]): Promise<void> {
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await this.requestToPromise(store.put({ id: this.recordKey, entries }));
    await this.transactionComplete(transaction);
  }

  private requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private transactionComplete(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  private saveToLocalStorage(entries: ScoreEntry[]): void {
    const storage = this.getLegacyStorage();
    if (!storage) {
      return;
    }
    storage.setItem(this.legacyStorageKey, JSON.stringify(entries));
  }

  private readLegacyScoreboard(): ScoreEntry[] {
    const storage = this.getLegacyStorage();
    if (!storage) {
      return [];
    }

    const saved = storage.getItem(this.legacyStorageKey);
    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);
      return this.normalizeScoreboard(Array.isArray(parsed) ? parsed : []);
    } catch {
      return [];
    }
  }

  private clearLegacyScoreboard(): void {
    const storage = this.getLegacyStorage();
    if (!storage) {
      return;
    }
    storage.removeItem(this.legacyStorageKey);
  }

  private getLegacyStorage(): Storage | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage;
  }

  private normalizeScoreboard(entries: unknown[]): ScoreEntry[] {
    return entries.map((entry) => this.normalizeEntry(entry));
  }

  private normalizeEntry(entry: unknown): ScoreEntry {
    const normalizedEntry =
      typeof entry === 'object' && entry !== null ? (entry as Partial<ScoreEntry>) : {};
    return {
      name: normalizedEntry.name ?? 'Unknown',
      score:
        typeof normalizedEntry.score === 'number'
          ? normalizedEntry.score
          : Number(normalizedEntry.score ?? 0),
      date: normalizedEntry.date ?? new Date().toISOString(),
      difficulty: (normalizedEntry.difficulty ?? 'Andi') as DifficultyLevel,
      stats: this.normalizeStats(normalizedEntry.stats)
    };
  }

  private normalizeStats(stats?: Partial<ScoreStats>): ScoreStats {
    return {
      timeRemaining: stats?.timeRemaining ?? 0,
      truttisCaught: stats?.truttisCaught ?? 0,
      specialTruttisCaught: stats?.specialTruttisCaught ?? 0,
      totalClicks: stats?.totalClicks ?? 0
    };
  }
}
