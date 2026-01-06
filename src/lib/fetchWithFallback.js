/**
 * Fetch helper with automatic fallback to static data
 * Provides graceful degradation when backend is unavailable
 */

import schoolNews from '@/data/news.school.json';
import studentNews from '@/data/news.student.json';
import pdfData from '@/data/pdf.json';

/**
 * Fetch news with timeout and fallback to static data
 * @param {string} category - 'school' or 'student'
 * @param {number} timeout - timeout in ms
 * @returns {Promise<Array>} news articles
 */
export async function fetchNewsWithFallback(category, timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`/api/news/list?category=${category}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('API failed');
    const payload = await response.json();
    return payload.items || payload.data || payload.records || [];
  } catch (err) {
    console.warn(`[news] API failed for category ${category}, using static data`, err);
    return category === 'student' ? studentNews : schoolNews;
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
    
    const response = await fetch(`/api/news/detail/${slug}`, {
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
    // Return static PDF data as view counts
    const views = {};
    pdfData.forEach(pdf => {
      views[pdf.id] = pdf.viewCount || 0;
    });
    return views;
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
