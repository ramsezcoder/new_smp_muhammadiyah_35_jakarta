import { getAuthHeaders, assertApiOk } from '@/lib/utils';

export async function listRegistrants() {
  const res = await fetch('/api/ppdb/list.php', {
    headers: getAuthHeaders('application/json'),
    credentials: 'include'
  });
  // ppdb list returns bare array without {success}; handle non-200 explicitly
  if (!res.ok) {
    const err = new Error(`List failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

export async function deleteRegistrant(id) {
  const res = await fetch('/api/ppdb/delete.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ id }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Delete failed');
  return true;
}
