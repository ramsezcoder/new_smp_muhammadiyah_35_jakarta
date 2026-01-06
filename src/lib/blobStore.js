/**
 * Minimal IndexedDB-based Blob store for static CMS
 * - Stores uploaded files as binary Blobs (not base64)
 * - Keeps only metadata in localStorage
 * - Provides object URLs for preview at runtime
 */

const DB_NAME = 'cms_blob_store';
const DB_VERSION = 1;

const CATEGORY_STORES = {
  gallery: 'gallery_blobs',
  staff: 'staff_blobs',
  featured: 'featured_blobs',
  news: 'news_blobs'
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(CATEGORY_STORES).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(category, mode, fn) {
  const db = await openDB();
  const tx = db.transaction(CATEGORY_STORES[category], mode);
  const store = tx.objectStore(CATEGORY_STORES[category]);
  const result = await fn(store);
  await tx.complete?.();
  return result;
}

export async function saveBlob(category, file, key) {
  const id = key || `${category}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const blob = file instanceof Blob ? file : new Blob([file], { type: file?.type || 'application/octet-stream' });
  await withStore(category, 'readwrite', (store) => store.put(blob, id));
  return id;
}

export async function getBlob(category, key) {
  return withStore(category, 'readonly', (store) => new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  }));
}

export async function getBlobUrl(category, key) {
  const blob = await getBlob(category, key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteBlob(category, key) {
  return withStore(category, 'readwrite', (store) => store.delete(key));
}

export async function estimateUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return { usage, quota };
    } catch {}
  }
  return { usage: 0, quota: 0 };
}

export function isSupported() {
  return 'indexedDB' in window;
}
