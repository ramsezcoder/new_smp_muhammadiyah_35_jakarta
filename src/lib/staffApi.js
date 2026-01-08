import { getAuthHeaders, assertApiOk } from '@/lib/utils';

export async function listStaff({ page = 1, limit = 100, includeUnpublished = true } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('published', includeUnpublished ? '0' : '1');
  const res = await fetch(`/api/staff/list.php?${params.toString()}`, { 
    headers: getAuthHeaders('application/json'),
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'List failed');
  return json.data;
}

export async function createStaff({ name, role, bio, photo }) {
  const form = new FormData();
  form.append('name', name);
  if (role) form.append('role', role);
  if (bio) form.append('bio', bio);
  if (photo) form.append('photo', photo);
  
  const headers = getAuthHeaders(null);
  const res = await fetch('/api/staff/create.php', { 
    method: 'POST', 
    body: form,
    headers,
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'Create failed');
  return json.data;
}

export async function updateStaff({ id, name, role, bio, photo, keepPhoto = true }) {
  const form = new FormData();
  form.append('id', String(id));
  form.append('name', name);
  if (role) form.append('role', role);
  if (bio) form.append('bio', bio);
  form.append('keep_photo', keepPhoto ? '1' : '0');
  if (photo) form.append('photo', photo);
  
  const headers = getAuthHeaders(null);
  const res = await fetch('/api/staff/update.php', { 
    method: 'POST', 
    body: form,
    headers,
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'Update failed');
  return json.data;
}

export async function deleteStaff(id) {
  const res = await fetch('/api/staff/delete.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ id }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Delete failed');
  return true;
}

export async function reorderStaff(ids) {
  const res = await fetch('/api/staff/reorder.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ ids }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Reorder failed');
  return true;
}
