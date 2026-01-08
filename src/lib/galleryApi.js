import { getAuthHeaders, assertApiOk } from '@/lib/utils';

export async function listGallery({ page = 1, limit = 100, includeUnpublished = true } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('published', includeUnpublished ? '0' : '1');
  const res = await fetch(`/api/gallery/list.php?${params.toString()}`, { 
    headers: getAuthHeaders('application/json'),
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'List failed');
  return json.data;
}

export async function uploadGallery({ file, title = '', alt = '' }) {
  const form = new FormData();
  form.append('image', file);
  if (title) form.append('title', title);
  if (alt) form.append('alt', alt);
  
  const headers = getAuthHeaders(null); // FormData sets its own content-type
  const res = await fetch('/api/gallery/upload.php', { 
    method: 'POST', 
    body: form,
    headers,
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'Upload failed');
  return json.data;
}

export async function deleteGallery(id) {
  const res = await fetch('/api/gallery/delete.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ id }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Delete failed');
  return true;
}

export async function reorderGallery(ids) {
  const res = await fetch('/api/gallery/reorder.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ ids }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Reorder failed');
  return true;
}

export async function updateGalleryMeta({ id, title, alt_text, is_published }) {
  const res = await fetch('/api/gallery/update_meta.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ id, title, alt_text, is_published }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Update failed');
  return true;
}
