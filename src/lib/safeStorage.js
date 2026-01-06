/**
 * Safe localStorage wrappers to avoid QuotaExceededError
 */

export function safeGetItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn(`[safeStorage] getItem failed for ${key}:`, e);
    return defaultValue;
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn('[safeStorage] Storage full');
      return false;
    }
    console.warn(`[safeStorage] setItem failed for ${key}:`, e);
    return false;
  }
}

export function exportJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
