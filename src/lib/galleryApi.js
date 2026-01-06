// Helper to get Authorization headers with Bearer token
function getHeaders() {
  const sessionStr = localStorage.getItem('app_session');
  const headers = { 'Content-Type': 'application/json' };
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    } catch (e) {
      console.error('Failed to parse session:', e);
    }
  }
  return headers;
}

export async function listGallery({ page = 1, limit = 100, includeUnpublished = true } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('published', includeUnpublished ? '0' : '1');
  const res = await fetch(`/api/gallery/list.php?${params.toString()}`, { 
    headers: getHeaders(),
    credentials: 'include' 
  });
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'List failed');
  return json.data;
}

export async function uploadGallery({ file, title = '', alt = '' }) {
  const form = new FormData();
  form.append('image', file);
  if (title) form.append('title', title);
  if (alt) form.append('alt', alt);
  
  const headers = getHeaders();
  delete headers['Content-Type']; // FormData sets this automatically
  
  const res = await fetch('/api/gallery/upload.php', { 
    method: 'POST', 
    body: form,
    headers,
    credentials: 'include' 
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Upload failed');
  return json.data;
}

export async function deleteGallery(id) {
  const res = await fetch('/api/gallery/delete.php', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ id }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Delete failed');
  return true;
}

export async function reorderGallery(ids) {
  const res = await fetch('/api/gallery/reorder.php', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ids }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Reorder failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Reorder failed');
  return true;
}

export async function updateGalleryMeta({ id, title, alt_text, is_published }) {
  const res = await fetch('/api/gallery/update_meta.php', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ id, title, alt_text, is_published }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Update failed');
  return true;
}
