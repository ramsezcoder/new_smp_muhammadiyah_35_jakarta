/**
 * Static Storage Helper
 * Manages localStorage-based CRUD operations for static mode
 */

import { STORAGE_KEYS, STATIC_MODE, MESSAGES } from '@/config/staticMode';

/**
 * Safe localStorage operations with error handling
 */
const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`[StaticStorage] Failed to get ${key}:`, error);
    return defaultValue;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[StaticStorage] Failed to set ${key}:`, error);
    return false;
  }
};

/**
 * Videos CRUD
 */
export const videosStorage = {
  getAll: () => {
    return safeGetItem(STORAGE_KEYS.VIDEOS, []);
  },
  
  add: (video) => {
    const videos = videosStorage.getAll();
    const newVideo = {
      ...video,
      id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      order: videos.length + 1
    };
    videos.push(newVideo);
    safeSetItem(STORAGE_KEYS.VIDEOS, videos);
    return newVideo;
  },
  
  update: (id, updates) => {
    const videos = videosStorage.getAll();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...updates };
      safeSetItem(STORAGE_KEYS.VIDEOS, videos);
      return videos[index];
    }
    return null;
  },
  
  delete: (id) => {
    const videos = videosStorage.getAll();
    const filtered = videos.filter(v => v.id !== id);
    safeSetItem(STORAGE_KEYS.VIDEOS, filtered);
    return true;
  },
  
  reorder: (ids) => {
    const videos = videosStorage.getAll();
    const ordered = ids.map((id, index) => {
      const video = videos.find(v => v.id === id);
      return video ? { ...video, order: index + 1 } : null;
    }).filter(Boolean);
    safeSetItem(STORAGE_KEYS.VIDEOS, ordered);
    return ordered;
  }
};

/**
 * Staff CRUD
 */
export const staffStorage = {
  getAll: () => {
    return safeGetItem(STORAGE_KEYS.STAFF, []);
  },
  
  add: (staff) => {
    const staffList = staffStorage.getAll();
    const newStaff = {
      ...staff,
      id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      uploadedAt: new Date().toISOString(),
      order: staffList.length + 1,
      active: true
    };
    staffList.push(newStaff);
    safeSetItem(STORAGE_KEYS.STAFF, staffList);
    return newStaff;
  },
  
  update: (id, updates) => {
    const staffList = staffStorage.getAll();
    const index = staffList.findIndex(s => s.id === id);
    if (index !== -1) {
      staffList[index] = { ...staffList[index], ...updates };
      safeSetItem(STORAGE_KEYS.STAFF, staffList);
      return staffList[index];
    }
    return null;
  },
  
  delete: (id) => {
    const staffList = staffStorage.getAll();
    const filtered = staffList.filter(s => s.id !== id);
    safeSetItem(STORAGE_KEYS.STAFF, filtered);
    return true;
  },
  
  reorder: (ids) => {
    const staffList = staffStorage.getAll();
    const ordered = ids.map((id, index) => {
      const staff = staffList.find(s => s.id === id);
      return staff ? { ...staff, order: index + 1 } : null;
    }).filter(Boolean);
    safeSetItem(STORAGE_KEYS.STAFF, ordered);
    return ordered;
  }
};

/**
 * Gallery CRUD
 */
export const galleryStorage = {
  getAll: () => {
    return safeGetItem(STORAGE_KEYS.GALLERY, []);
  },
  
  add: (image) => {
    const gallery = galleryStorage.getAll();
    const newImage = {
      ...image,
      id: `gal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      uploadedAt: new Date().toISOString(),
      order: gallery.length + 1
    };
    gallery.push(newImage);
    safeSetItem(STORAGE_KEYS.GALLERY, gallery);
    return newImage;
  },
  
  update: (id, updates) => {
    const gallery = galleryStorage.getAll();
    const index = gallery.findIndex(g => g.id === id);
    if (index !== -1) {
      gallery[index] = { ...gallery[index], ...updates };
      safeSetItem(STORAGE_KEYS.GALLERY, gallery);
      return gallery[index];
    }
    return null;
  },
  
  delete: (id) => {
    const gallery = galleryStorage.getAll();
    const filtered = gallery.filter(g => g.id !== id);
    safeSetItem(STORAGE_KEYS.GALLERY, filtered);
    return true;
  },
  
  reorder: (ids) => {
    const gallery = galleryStorage.getAll();
    const ordered = ids.map((id, index) => {
      const image = gallery.find(g => g.id === id);
      return image ? { ...image, order: index + 1 } : null;
    }).filter(Boolean);
    safeSetItem(STORAGE_KEYS.GALLERY, ordered);
    return ordered;
  }
};

/**
 * Convert file to base64 for storage in static mode
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Simulate file upload in static mode
 * Returns a data URL that can be stored
 */
export const simulateUpload = async (file, category = 'general') => {
  try {
    const base64 = await fileToBase64(file);
    const filename = `${category}-${Date.now()}.${file.name.split('.').pop()}`;
    
    return {
      success: true,
      file: base64, // Store as data URL
      filename,
      url: base64,
      originalName: file.name
    };
  } catch (error) {
    console.error('[StaticStorage] Upload simulation failed:', error);
    return {
      success: false,
      error: 'Failed to process file'
    };
  }
};
