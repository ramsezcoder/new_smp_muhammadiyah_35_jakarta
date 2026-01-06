/**
 * Static Mode Configuration
 * When STATIC_MODE is true, the app uses local fallback data
 * and doesn't require a backend server to run.
 */

export const STATIC_MODE = true;

// Fallback timeout - try API for this long before using static data
export const API_TIMEOUT = 5000; // 5 seconds

// Local storage keys for static mode
export const STORAGE_KEYS = {
  // Draft data (editable in dashboard)
  VIDEOS_DRAFT: 'cms_videos_draft',
  STAFF_DRAFT: 'cms_staff_draft',
  GALLERY_DRAFT: 'cms_gallery_draft',
  NEWS_DRAFT: 'cms_news_draft',

  // Published data (read-only for public pages)
  VIDEOS_PUBLISHED: 'cms_videos_published',
  STAFF_PUBLISHED: 'cms_staff_published',
  GALLERY_PUBLISHED: 'cms_gallery_published',
  NEWS_PUBLISHED: 'cms_news_published',

  SESSION: 'app_session',
  SETTINGS: 'app_settings',
  USERS: 'app_users'
};

// Upload paths for static mode
export const UPLOAD_PATHS = {
  GALLERY: '/uploads/gallery',
  STAFF: '/uploads/staff',
  NEWS: '/uploads/news',
  FEATURED: '/uploads/featured'
};

// Static mode messages
export const MESSAGES = {
  FALLBACK_NEWS: 'Gagal memuat berita, menampilkan data lokal.',
  FALLBACK_ARTICLE: 'Gagal memuat artikel, menampilkan konten lokal.',
  STATIC_MODE_ADMIN: 'Fitur online admin dinonaktifkan dalam mode statis.',
  OPERATION_SUCCESS: 'Berhasil disimpan.',
  OPERATION_FAILED: 'Operasi gagal. Sistem berjalan dalam mode statis.',
  UPLOAD_SUCCESS: 'File berhasil disimpan.',
  UPLOAD_FAILED: 'Upload gagal. Pastikan file valid.',
  PUBLISH_SUCCESS: 'Konten berhasil dipublish.',
  PUBLISH_INFO: 'Publik akan membaca data yang telah dipublish.'
};

