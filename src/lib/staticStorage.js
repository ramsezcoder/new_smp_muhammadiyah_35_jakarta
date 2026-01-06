/**
 * Static Storage Helper
 * Manages localStorage-based CRUD operations for static mode
 */

import { STORAGE_KEYS } from '@/config/staticMode';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';
import { saveBlob, getBlobUrl, deleteBlob } from '@/lib/blobStore';

/**
 * Safe localStorage operations with error handling
 */
// Use safeStorage wrappers

/**
 * Videos CRUD
 */
export const videosStorage = {
  getAll: () => {
    return safeGetItem(STORAGE_KEYS.VIDEOS_DRAFT, []);
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
    safeSetItem(STORAGE_KEYS.VIDEOS_DRAFT, videos);
    return newVideo;
  },
  
  update: (id, updates) => {
    const videos = videosStorage.getAll();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...updates };
      safeSetItem(STORAGE_KEYS.VIDEOS_DRAFT, videos);
      return videos[index];
    }
    return null;
  },
  
  delete: (id) => {
    const videos = videosStorage.getAll();
    const filtered = videos.filter(v => v.id !== id);
    safeSetItem(STORAGE_KEYS.VIDEOS_DRAFT, filtered);
    return true;
  },
  
  reorder: (ids) => {
    const videos = videosStorage.getAll();
    const ordered = ids.map((id, index) => {
      const video = videos.find(v => v.id === id);
      return video ? { ...video, order: index + 1 } : null;
    }).filter(Boolean);
    safeSetItem(STORAGE_KEYS.VIDEOS_DRAFT, ordered);
    return ordered;
  }

  publish: () => {
    const videos = videosStorage.getAll();
    const metadataOnly = videos.map(({ id, title, description, videoType, url, category, createdAt, order }) => ({
      id, title, description, type: videoType, url, category, createdAt, order
    }));
    safeSetItem(STORAGE_KEYS.VIDEOS_PUBLISHED, metadataOnly);
    return metadataOnly;
  }
};

/**
 * Staff CRUD
 */
export const staffStorage = {
  getAll: () => {
    return safeGetItem(STORAGE_KEYS.STAFF_DRAFT, []);
  },
  
  add: async (staff) => {
    const staffList = staffStorage.getAll();
    const newStaff = {
      ...staff,
      id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      uploadedAt: new Date().toISOString(),
      order: staffList.length + 1,
      active: true
    };
    // If photoFile provided, store blob in IDB and keep fileKey only
    if (staff.photoFile) {
      const key = await saveBlob('staff', staff.photoFile, newStaff.id);
      newStaff.fileKey = key;
      delete newStaff.photoFile;
    }
    staffList.push(newStaff);
    safeSetItem(STORAGE_KEYS.STAFF_DRAFT, staffList);
    return newStaff;
  },
  
  update: async (id, updates) => {
    const staffList = staffStorage.getAll();
    const index = staffList.findIndex(s => s.id === id);
    if (index !== -1) {
      const current = staffList[index];
      const next = { ...current, ...updates };
      // If new photo provided, replace blob; else reuse existing
      if (updates.photoFile) {
        await saveBlob('staff', updates.photoFile, id);
        next.fileKey = id;
        delete next.photoFile;
      }
      staffList[index] = next;
      safeSetItem(STORAGE_KEYS.STAFF_DRAFT, staffList);
      return staffList[index];
    }
    return null;
  },
  
  delete: (id) => {
    const staffList = staffStorage.getAll();
    const filtered = staffList.filter(s => s.id !== id);
    safeSetItem(STORAGE_KEYS.STAFF_DRAFT, filtered);
    // best-effort remove blob
    deleteBlob('staff', id).catch(() => {});
    return true;
  },
  
  reorder: (ids) => {
    const staffList = staffStorage.getAll();
    const ordered = ids.map((id, index) => {
      const staff = staffList.find(s => s.id === id);
      return staff ? { ...staff, order: index + 1 } : null;
    }).filter(Boolean);
    safeSetItem(STORAGE_KEYS.STAFF_DRAFT, ordered);
    return ordered;
  },

  publish: async () => {
    const staffList = staffStorage.getAll();
    const metadataOnly = staffList.filter(s => s.active !== false).map(({ id, name, position, role, fileKey, uploadedAt, order, active }) => ({
      id, name, position: position || role, photoKey: fileKey || id, uploadedAt, order, active
    }));
    safeSetItem(STORAGE_KEYS.STAFF_PUBLISHED, metadataOnly);
    return metadataOnly;
  }
};

/**
 * Gallery CRUD
 */
export const galleryStorage = {
  getAll: () => {
    return safeGetItem(STORAGE_KEYS.GALLERY_DRAFT, []);
  },
  
  add: async (image) => {
    const gallery = galleryStorage.getAll();
    const newImage = {
      ...image,
      id: `gal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      uploadedAt: new Date().toISOString(),
      order: gallery.length + 1
    };
    if (image.file) {
      const key = await saveBlob('gallery', image.file, newImage.id);
      newImage.fileKey = key;
      delete newImage.file;
    }
    gallery.push(newImage);
    safeSetItem(STORAGE_KEYS.GALLERY_DRAFT, gallery);
    return newImage;
  },
  
  update: async (id, updates) => {
    const gallery = galleryStorage.getAll();
    const index = gallery.findIndex(g => g.id === id);
    if (index !== -1) {
      const current = gallery[index];
      const next = { ...current, ...updates };
      if (updates.file) {
        await saveBlob('gallery', updates.file, id);
        next.fileKey = id;
        delete next.file;
      }
      gallery[index] = next;
      safeSetItem(STORAGE_KEYS.GALLERY_DRAFT, gallery);
      return gallery[index];
    }
    return null;
  },
  
  delete: (id) => {
    const gallery = galleryStorage.getAll();
    const filtered = gallery.filter(g => g.id !== id);
    safeSetItem(STORAGE_KEYS.GALLERY_DRAFT, filtered);
    deleteBlob('gallery', id).catch(() => {});
    return true;
  },
  
  reorder: (ids) => {
    const gallery = galleryStorage.getAll();
    const ordered = ids.map((id, index) => {
      const image = gallery.find(g => g.id === id);
      return image ? { ...image, order: index + 1 } : null;
    }).filter(Boolean);
    safeSetItem(STORAGE_KEYS.GALLERY_DRAFT, ordered);
    return ordered;
  },

  publish: () => {
    const gallery = galleryStorage.getAll();
    const metadataOnly = gallery.map(({ id, filename, name, altText, seoTitle, description, fileKey, uploadedAt, order }) => ({
      id,
      filename: filename || `${name || 'gallery'}-${id}.webp`,
      title: name || seoTitle || 'Galeri Sekolah',
      alt: altText || name || 'Foto Kegiatan Sekolah',
      url: `/uploads/gallery/${filename || `${name || 'gallery'}-${id}.webp`}`,
      fileKey: fileKey || id,
      createdAt: uploadedAt,
      order
    }));
    safeSetItem(STORAGE_KEYS.GALLERY_PUBLISHED, metadataOnly);
    return metadataOnly;
  }
};

/**
 * Convert file to base64 for storage in static mode
 */
// Removed base64 conversion; using IndexedDB blob storage instead.

/**
 * Simulate file upload in static mode
 * Returns a data URL that can be stored
 */
export const simulateUpload = async (file, category = 'general') => {
  try {
    const filename = `${category}-${Date.now()}.${file.name.split('.').pop()}`;
    const key = await saveBlob(category === 'featured' ? 'featured' : category, file);
    const previewUrl = await getBlobUrl(category === 'featured' ? 'featured' : category, key);
    return { success: true, filename, key, url: previewUrl };
  } catch (error) {
    console.error('[StaticStorage] Upload simulation failed:', error);
    return { success: false, error: 'Failed to process file' };
  }
};
