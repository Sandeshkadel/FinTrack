import * as SQLite from 'expo-sqlite';

/**
 * SQLite layer for storing larger binary blobs (images) and structured records.
 *
 * The web version stored everything in localStorage. The mobile app uses:
 *  - AsyncStorage for small structured data (the storage/storage.ts module)
 *  - SQLite for image blobs so the 6MB AsyncStorage limit never becomes a problem
 */

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('fintrack.db').then(async (db) => {
      await init(db);
      return db;
    }).catch((err) => {
      // If init or open fails, clear the cached promise so the next call retries
      // instead of poisoning the whole app with a forever-rejected promise.
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

async function init(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY NOT NULL,
      record_id TEXT NOT NULL,
      record_type TEXT NOT NULL,
      data_uri TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_images_record ON images(record_id, record_type);
  `);
}

export interface StoredImage {
  id: string;
  recordId: string;
  recordType: 'income' | 'expense' | 'goal';
  dataUri: string;
  sortOrder: number;
  createdAt: string;
}

export const imageDB = {
  async add(recordId: string, recordType: 'income' | 'expense' | 'goal', dataUri: string, sortOrder: number = 0): Promise<string> {
    const db = await getDB();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.runAsync(
      'INSERT INTO images (id, record_id, record_type, data_uri, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      recordId,
      recordType,
      dataUri,
      sortOrder,
      new Date().toISOString(),
    );
    return id;
  },

  async getForRecord(recordId: string): Promise<string[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<{ data_uri: string }>(
      'SELECT data_uri FROM images WHERE record_id = ? ORDER BY sort_order ASC',
      recordId,
    );
    return rows.map((r) => r.data_uri);
  },

  async getAllForRecords(recordIds: string[]): Promise<Record<string, string[]>> {
    if (recordIds.length === 0) return {};
    // Android's SQLiteStatement has a per-call parameter limit (999 on older
    // devices, 32766 on newer). Chunk to 500 so power users with hundreds of
    // records never trip the limit and crash hydration.
    const CHUNK = 500;
    const db = await getDB();
    const out: Record<string, string[]> = {};
    for (let i = 0; i < recordIds.length; i += CHUNK) {
      const slice = recordIds.slice(i, i + CHUNK);
      const placeholders = slice.map(() => '?').join(',');
      const rows = await db.getAllAsync<{ record_id: string; data_uri: string; sort_order: number }>(
        `SELECT record_id, data_uri, sort_order FROM images WHERE record_id IN (${placeholders}) ORDER BY sort_order ASC`,
        ...slice,
      );
      rows.forEach((r) => {
        if (!r || typeof r.record_id !== 'string') return;
        if (!out[r.record_id]) out[r.record_id] = [];
        out[r.record_id].push(r.data_uri);
      });
    }
    return out;
  },

  async deleteForRecord(recordId: string) {
    const db = await getDB();
    await db.runAsync('DELETE FROM images WHERE record_id = ?', recordId);
  },

  async count(): Promise<number> {
    const db = await getDB();
    const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM images');
    return row?.c ?? 0;
  },
};
