/**
 * Safe JSON fetch utility that handles HTML responses, 404s, and parse errors
 * Returns empty array on any failure to prevent UI crashes
 */
export const loadJsonSafe = async (url) => {
  try {
    const response = await fetch(url);
    
    // Handle non-OK responses
    if (!response.ok) {
      console.warn(`[loadJsonSafe] HTTP ${response.status} for ${url}`);
      return [];
    }
    
    // Check content type to detect HTML responses
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.warn(`[loadJsonSafe] Non-JSON response (${contentType}) for ${url}`);
      return [];
    }
    
    const text = await response.text();
    
    // Detect HTML responses (common when hitting SPA fallback)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.warn(`[loadJsonSafe] HTML response detected for ${url}`);
      return [];
    }
    
    // Try parsing JSON
    const data = JSON.parse(text);
    return data;
    
  } catch (error) {
    console.warn(`[loadJsonSafe] Failed to load ${url}:`, error.message);
    return [];
  }
};

/**
 * Safe API call wrapper with error handling
 */
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const contentType = response.headers.get('content-type');
    
    // Check if response is HTML instead of JSON
    if (contentType && !contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON. API endpoint may not be available.');
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error(`[apiCall] ${url} failed:`, error);
    return { 
      success: false, 
      error: error.message || 'Request failed',
      isNetworkError: error.name === 'TypeError' && error.message.includes('fetch')
    };
  }
};

/**
 * Validate and extract YouTube video ID
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  
  return null;
};

/**
 * Get YouTube thumbnail URL from video ID
 */
export const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Validate file type for image uploads
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 4 * 1024 * 1024; // 4MB
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 4MB.' };
  }
  
  return { valid: true };
};
