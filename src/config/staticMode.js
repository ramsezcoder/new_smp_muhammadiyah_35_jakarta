/**
 * Static Mode Configuration
 * When STATIC_MODE is true, the app uses local fallback data
 * and doesn't require a backend server to run.
 */

export const STATIC_MODE = true;

// Fallback timeout - try API for this long before using static data
export const API_TIMEOUT = 5000; // 5 seconds

// Static mode messages
export const MESSAGES = {
  FALLBACK_NEWS: 'Gagal memuat berita, menampilkan data lokal.',
  FALLBACK_ARTICLE: 'Gagal memuat artikel, menampilkan konten lokal.',
  STATIC_MODE_ADMIN: 'Fitur online admin dinonaktifkan dalam mode statis.',
};
