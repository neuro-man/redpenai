
import { EditorSnapshot } from "../types";

const DB_NAME = 'RedPenDB';
const DB_VERSION = 2; // Upgraded from 1
const STORE_NAME = 'AppState';
const HISTORY_STORE_NAME = 'History';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store 1: AppState (Key-Value)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }

      // Store 2: History (Snapshots)
      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        db.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getValue = async (key: string): Promise<string | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string || null);
    });
  } catch (error) {
    console.error(`Error getting value for ${key}:`, error);
    return null;
  }
};

export const setValue = async (key: string, value: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`Error setting value for ${key}:`, error);
  }
};

// --- History / Snapshot Methods ---

export const saveSnapshot = async (content: string, type: 'manual' | 'auto'): Promise<boolean> => {
    if (!content || content.trim().length === 0) return false;

    try {
        const db = await initDB();
        
        // 1. Check the last snapshot to avoid duplicates
        const lastSnapshot = await new Promise<EditorSnapshot | undefined>((resolve) => {
             const transaction = db.transaction(HISTORY_STORE_NAME, 'readonly');
             const store = transaction.objectStore(HISTORY_STORE_NAME);
             // Get keys, assuming timestamps, max key is last
             const cursorReq = store.openCursor(null, 'prev');
             cursorReq.onsuccess = (e) => {
                 const cursor = (e.target as IDBRequest).result;
                 if (cursor) {
                     resolve(cursor.value);
                 } else {
                     resolve(undefined);
                 }
             };
             cursorReq.onerror = () => resolve(undefined);
        });

        if (lastSnapshot && lastSnapshot.content === content) {
            // Content hasn't changed, skip saving
            return false;
        }

        // 2. Save new snapshot
        const snapshot: EditorSnapshot = {
            id: Date.now(),
            content: content,
            summary: content.substring(0, 60).replace(/\n/g, ' ') + (content.length > 60 ? '...' : ''),
            type: type
        };

        const transaction = db.transaction(HISTORY_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        store.add(snapshot);

        // Optional: Prune old history (keep last 50)
        // ... implementation for pruning would go here
        
        return true; // Successfully saved new snapshot
        
    } catch (error) {
        console.error("Failed to save snapshot", error);
        return false;
    }
};

export const getHistory = async (): Promise<EditorSnapshot[]> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE_NAME, 'readonly');
            const store = transaction.objectStore(HISTORY_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by ID desc (newest first)
                const results = request.result as EditorSnapshot[];
                results.sort((a, b) => b.id - a.id);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get history", error);
        return [];
    }
};

export const getHistoryCount = async (): Promise<number> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE_NAME, 'readonly');
            const store = transaction.objectStore(HISTORY_STORE_NAME);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        return 0;
    }
};
