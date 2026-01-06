export async function listArticles({ page = 1, limit = 20, status = 'published' } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('status', status);
  const res = await fetch(`/api/articles/list.php?${params.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'List failed');
  return json.data;
}

export async function createArticle({ title, slug, content, excerpt, category, tags, status, seo_title, seo_description, featured_image }) {
  const form = new FormData();
  form.append('title', title);
  form.append('slug', slug);
  form.append('content', content);
  form.append('excerpt', excerpt || '');
  form.append('category', category || '');
  form.append('tags', JSON.stringify(tags || []));
  form.append('status', status || 'draft');
  form.append('seo_title', seo_title || '');
  form.append('seo_description', seo_description || '');
  if (featured_image) form.append('featured_image', featured_image);
  
  const res = await fetch('/api/articles/create.php', { method: 'POST', body: form, credentials: 'include' });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Create failed');
  return json.data;
}

export async function updateArticle({ id, title, slug, content, excerpt, category, tags, status, seo_title, seo_description, featured_image, keep_image = true }) {
  const form = new FormData();
  form.append('id', String(id));
  form.append('title', title);
  form.append('slug', slug);
  form.append('content', content);
  form.append('excerpt', excerpt || '');
  form.append('category', category || '');
  form.append('tags', JSON.stringify(tags || []));
  form.append('status', status || 'draft');
  form.append('seo_title', seo_title || '');
  form.append('seo_description', seo_description || '');
  form.append('keep_image', keep_image ? '1' : '0');
  if (featured_image) form.append('featured_image', featured_image);
  
  const res = await fetch('/api/articles/update.php', { method: 'POST', body: form, credentials: 'include' });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Update failed');
  return json.data;
}

export async function deleteArticle(id) {
  const res = await fetch('/api/articles/delete.php', {
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

export async function reorderArticles(ids) {
  const res = await fetch('/api/articles/reorder.php', {
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
