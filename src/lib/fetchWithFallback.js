/**
 * Fetch helpers that rely solely on the PHP backend.
 * No local JSON/static fallbacks are used.
 */

/**
 * Fetch news with timeout and fallback to static data
 * @param {string} category - 'school' or 'student'
 * @param {{ timeout?: number, page?: number, limit?: number }} opts
 * @returns {Promise<{ items: Array, pagination: object }>}
 */
export async function fetchNews(category, opts = {}) {
  const timeout = opts.timeout ?? 3000;
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 9;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await fetch(`/api/news/list.php?${params.toString()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('API failed');
    const payload = await response.json();
    const items = payload.items || payload.data || payload.records || [];
    const total = payload.totalRecords ?? items.length;
    const pages = Math.max(1, payload.totalPages || Math.ceil(total / limit));
    const currentPage = payload.page || page;
    return { items, pagination: { page: currentPage, pages, total } };
  } catch (err) {
    throw new Error(err?.message || 'Failed to load news');
  }
}

/**
 * Fetch single news article with fallback
 * @param {string} slug - article slug
 * @param {number} timeout - timeout in ms
 * @returns {Promise<Object|null>} article or null
 */
export async function fetchArticle(slug, timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`/api/news/detail.php?slug=${encodeURIComponent(slug)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('API failed');
    const payload = await response.json();
    return payload.record || payload.data || payload.article || payload.post || null;
  } catch (err) {
    throw new Error(err?.message || 'Failed to load article');
  }
}
