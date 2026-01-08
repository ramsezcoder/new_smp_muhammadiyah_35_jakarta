
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ---- API client helpers (Phase 3 normalization) ----
export function getAuthHeaders(contentType = 'application/json') {
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  try {
    const sessionStr = localStorage.getItem('app_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
    }
  } catch {
    // ignore parse errors; no silent failure beyond missing auth header
  }
  return headers;
}

export async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function assertApiOk(res, defaultMessage = 'Request failed') {
  const status = res.status;
  const json = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(json?.message || `${defaultMessage}: ${status}`);
    err.status = status;
    err.data = json?.data;
    throw err;
  }
  if (json && json.success === false) {
    const err = new Error(json.message || defaultMessage);
    err.status = status;
    err.data = json.data;
    throw err;
  }
  return json ?? { success: true, data: null };
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, credentials = 'include' } = {}) {
  const res = await fetch(path, { method, headers, body, credentials });
  const json = await assertApiOk(res, 'API request failed');
  return { ok: true, status: res.status, json };
}
