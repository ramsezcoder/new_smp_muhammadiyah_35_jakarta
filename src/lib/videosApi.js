import { getAuthHeaders, assertApiOk } from '@/lib/utils';

export async function listVideos({ page = 1, limit = 100, includeUnpublished = true } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('published', includeUnpublished ? '0' : '1');
  const res = await fetch(`/api/videos/list.php?${params.toString()}`, { 
    headers: getAuthHeaders('application/json'),
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'List failed');
  return json.data;
}

export async function createVideo({ title, youtube_id, thumbnail_url = '', description = '' }) {
  const res = await fetch('/api/videos/create.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ title, youtube_id, thumbnail_url, description }),
    credentials: 'include'
  });
  const json = await assertApiOk(res, 'Create failed');
  return json.data;
}

export async function updateVideo({ id, title, youtube_id, thumbnail_url = '', description = '' }) {
  const res = await fetch('/api/videos/update.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ id, title, youtube_id, thumbnail_url, description }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Update failed');
  return true;
}

export async function deleteVideo(id) {
  const res = await fetch('/api/videos/delete.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ id }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Delete failed');
  return true;
}

export async function reorderVideos(ids) {
  const res = await fetch('/api/videos/reorder.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ ids }),
    credentials: 'include'
  });
  await assertApiOk(res, 'Reorder failed');
  return true;
}
