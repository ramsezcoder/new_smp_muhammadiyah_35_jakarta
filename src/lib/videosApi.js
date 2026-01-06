export async function listVideos({ page = 1, limit = 100, includeUnpublished = true } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('published', includeUnpublished ? '0' : '1');
  const res = await fetch(`/api/videos/list.php?${params.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'List failed');
  return json.data;
}

export async function createVideo({ title, youtube_id, thumbnail_url = '', description = '' }) {
  const res = await fetch('/api/videos/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, youtube_id, thumbnail_url, description }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Create failed');
  return json.data;
}

export async function updateVideo({ id, title, youtube_id, thumbnail_url = '', description = '' }) {
  const res = await fetch('/api/videos/update.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, youtube_id, thumbnail_url, description }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Update failed');
  return true;
}

export async function deleteVideo(id) {
  const res = await fetch('/api/videos/delete.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Delete failed');
  return true;
}

export async function reorderVideos(ids) {
  const res = await fetch('/api/videos/reorder.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Reorder failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Reorder failed');
  return true;
}
