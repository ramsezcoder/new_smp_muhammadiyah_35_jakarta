/**
 * Fetch helper with automatic fallback to static data
 * Provides graceful degradation when backend is unavailable
 */

import schoolNews from '@/data/news.school.js';
import studentNews from '@/data/news.student.js';
const pdfData = [];

/**
 * Fetch news with timeout and fallback to static data
 * @param {string} category - 'school' or 'student'
 * @param {{ timeout?: number, page?: number, limit?: number }} opts
 * @returns {Promise<{ items: Array, pagination: object }>}
 */
export async function fetchNewsWithFallback(category, opts = {}) {
  const timeout = opts.timeout ?? 3000;
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 9;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const params = new URLSearchParams({ category, page: String(page), limit: String(limit) });
    const response = await fetch(`/api/news/list.php?${params.toString()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('API failed');
    const payload = await response.json();
    const items = payload.items || payload.data || payload.records || [];
    const pagination = payload.pagination || { page: 1, pages: 1, total: items.length };
    return { items, pagination };
  } catch (err) {
    console.warn(`[news] API failed for category ${category}, using static data`, err);
    const fallbackItems = category === 'student' ? studentNews : schoolNews;
    return {
      items: fallbackItems,
      pagination: {
        page: 1,
        pages: 1,
        total: fallbackItems.length
      }
    };
  }
}

/**
 * Fetch single news article with fallback
 * @param {string} slug - article slug
 * @param {number} timeout - timeout in ms
 * @returns {Promise<Object|null>} article or null
 */
export async function fetchArticleWithFallback(slug, timeout = 3000) {
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
    console.warn(`[news] API failed for slug ${slug}, searching static data`, err);
    // Search in both static datasets
    const allNews = [...schoolNews, ...studentNews];
    return allNews.find(n => (n.slug || n.id) === slug) || null;
  }
}

/**
 * Fetch PDF view counts with fallback
 * @param {number} timeout - timeout in ms
 * @returns {Promise<Object>} view counts by ID
 */
export async function fetchPdfViewsWithFallback(timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch('/api/pdf/views', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    return data.views || {};
  } catch (err) {
    console.warn('[pdf] API failed for view counts, using static data', err);
    // Return empty view counts in static mode
    return {};
  }
}

/**
 * Increment PDF view count (graceful failure in static mode)
 * @param {number} pdfId - PDF ID
 * @param {string} fileName - file name
 * @returns {Promise<boolean>} success or not
 */
export async function incrementPdfViewWithFallback(pdfId, fileName, timeout = 2000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`/api/pdf/view/${pdfId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('API failed');
    return true;
  } catch (err) {
    console.warn(`[pdf] Failed to increment view for ${pdfId}, running in static mode`, err);
    // Silently fail - don't break UI
    return false;
  }
}

/**
 * Get all static PDF data
 */
export function getStaticPdfData() {
  return pdfData;
}

/**
 * Get all static news data
 */
export function getStaticNewsData(category = null) {
  if (category === 'student') return studentNews;
  if (category === 'school') return schoolNews;
  return [...schoolNews, ...studentNews];
}
