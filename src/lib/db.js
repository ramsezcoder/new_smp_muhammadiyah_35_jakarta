// Simulation of a Database Layer using LocalStorage
// Abstracts data access to resemble a MySQL schema structure
const importedPosts = [];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509062522246-3755977927d7';
const GALLERY_KEY = 'gallery_uploads';
const STAFF_KEY = 'staff_profiles';
const VIDEO_KEY = 'video_gallery';

const slugify = (text = '') => text
  .toString()
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '');

const formatName = (name) => {
  if (!name) return '';
  return name.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
};

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const computeReadTime = (html) => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.min(15, Math.round(words / 200) || 2));
};

const extractFirstImage = (html) => {
  if (!html) return '';
  const match = html.match(/<img[^>]+src=["']([^"'>\s]+)["']/i);
  return match?.[1] || '';
};

const slugKey = (article) => (article?.seo?.slug || article?.slug || String(article?.id || '')).toLowerCase();

const buildSeoFilename = (name, uploadedAt) => {
  const base = slugify(name || 'gallery');
  const stamp = uploadedAt ? new Date(uploadedAt).getTime() : Date.now();
  return `${base || 'gallery'}-${stamp}.webp`;
};

const normalizeOrder = (items = []) => items
  .map((item, idx) => ({ ...item, order: typeof item.order === 'number' ? item.order : idx }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const mergeNews = (base = [], incoming = []) => {
  const map = new Map();
  base.forEach((item) => {
    const key = slugKey(item);
    if (key) map.set(key, item);
  });
  incoming.forEach((item) => {
    const key = slugKey(item);
    if (!key) return;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, item);
      return;
    }
    const merged = { ...prev, ...item, id: prev.id || item.id };
    if (prev.featuredImage && (!item.featuredImage || prev.featuredImage !== FALLBACK_IMAGE)) {
      merged.featuredImage = prev.featuredImage;
    }
    map.set(key, merged);
  });
  return Array.from(map.values());
};

const normalizeImportedPost = (post, idx) => {
  if (!post?.title) return null;
  const tagsArray = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === 'string'
      ? post.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];
  const slug = (post.slug || post.seo?.slug || `imported-${idx}`).toLowerCase();
  const createdAt = normalizeDate(post.createdAt || post.createdDate);
  const updatedAt = normalizeDate(post.updatedAt || post.updatedDate || createdAt);
  const seoTitle = post.seo?.title || post.seo?.seoTitle || post.title;
  const seoDescription = post.seo?.description || post.seo?.metaDescription || post.excerpt || stripHtml(post.content).slice(0, 200);
  const keywords = Array.isArray(post.seo?.keywords) ? post.seo.keywords.filter(Boolean) : [];
  const bodyImage = extractFirstImage(post.content);
  const featuredImage = post.featuredImage || bodyImage || FALLBACK_IMAGE;

  return {
    id: post.id || slug || `imported-${idx}`,
    title: post.title,
    slug,
    channel: 'school',
    excerpt: post.excerpt || stripHtml(post.content).slice(0, 180),
    content: post.content || '',
    featuredImage,
    authorId: post.authorId || 0,
    authorName: post.authorName || 'Tim Redaksi',
    authorRole: post.authorRole || 'Editor',
    category: post.category || 'Berita',
    tags: tagsArray.join(', '),
    hashtags: tagsArray.slice(0, 4).map(t => `#${t.replace(/^#+/, '').replace(/\s+/g, '')}`),
    seo: {
      focusKeyphrase: post.seo?.focusKeyphrase || keywords[0] || '',
      seoTitle,
      slug,
      metaDescription: seoDescription,
      readabilityScore: post.seo?.readabilityScore || 70,
      seoScore: post.seo?.seoScore || 70,
      keywordSuggestions: keywords,
      aiNotes: post.seo?.aiNotes || []
    },
    readTime: post.readTime || computeReadTime(post.content),
    status: post.status || 'published',
    createdAt,
    updatedAt,
    publishedAt: post.publishedAt || createdAt
  };
};

const IMPORTED_NEWS = (Array.isArray(importedPosts) ? importedPosts : [])
  .map(normalizeImportedPost)
  .filter(Boolean);

// NOTE: Legacy default users removed to prevent plaintext credential leakage.
// Authentication is handled via PHP API in src/lib/authApi.js.

const DEFAULT_SETTINGS = {
  siteName: 'SMP Muhammadiyah 35 Jakarta',
  email: 'smpmuh35@gmail.com',
  phone: '(021) 8459-1142',
  whatsappNumber: '6281234567890',
  address: 'Jl. Raya Condet No. 27, Jakarta Timur, DKI Jakarta 13530',
  instagramUrl: 'https://instagram.com/smpmuh35jakarta',
  youtubeUrl: 'https://youtube.com/c/smpmuh35jakarta',
  facebookUrl: 'https://facebook.com/smpmuh35jakarta',
  twitterUrl: 'https://twitter.com/smpmuh35jkt',
  maxUploadSize: 5, // MB
  maintenanceMode: false
};

const DEFAULT_STAFF = [
  { name: "R. Agung Budi Laksono", position: "Waka Sarpras", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop", active: true },
  { name: "Rubiyatun", position: "Waka Kesiswaan", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop", active: true },
  { name: "Istiana", position: "Waka Kurikulum", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop", active: true },
  { name: "Rini Yuni Astuti", position: "Waka Humas", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop", active: true },
  { name: "Suparliyanto", position: "PLT Kasubag TU", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", active: true },
  { name: "Sri Rahayu", position: "Guru Kimia", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop", active: true },
  { name: "Boini", position: "Guru Matematika", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop", active: true },
  { name: "Arief Teguh Rahardjo", position: "Guru Matematika", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop", active: true },
  { name: "Dahrotun", position: "Guru Bahasa Indonesia", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop", active: true },
  { name: "Dwijatno Hamardianto", position: "Guru BK", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop", active: true },
  { name: "Agus Soedarsono", position: "Guru Matematika", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop", active: true },
  { name: "Rahayu Wuryaningsih", position: "Guru Bahasa Jawa", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop", active: true },
];

const DEFAULT_GALLERY = [
  { name: "Upacara Bendera", category: "Kegiatan Rutin", url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop", altText: "Upacara bendera rutin SMP Muhammadiyah 35 Jakarta", seoTitle: "Upacara Bendera" },
  { name: "Kegiatan Pembelajaran", category: "Akademik", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop", altText: "Kegiatan pembelajaran di kelas", seoTitle: "Pembelajaran di Kelas" },
  { name: "Lomba Sains", category: "Prestasi", url: "https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=800&h=600&fit=crop", altText: "Lomba sains antar sekolah", seoTitle: "Lomba Sains" },
  { name: "Kegiatan Olahraga", category: "Ekstrakurikuler", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop", altText: "Kegiatan olahraga siswa", seoTitle: "Olahraga" },
  { name: "Pesantren Kilat", category: "Keagamaan", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop", altText: "Pesantren kilat ramadan", seoTitle: "Pesantren Kilat" },
  { name: "Praktikum Laboratorium", category: "Akademik", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop", altText: "Praktikum di laboratorium", seoTitle: "Praktikum Lab" },
  { name: "Pentas Seni", category: "Ekstrakurikuler", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop", altText: "Pentas seni tahunan", seoTitle: "Pentas Seni" },
  { name: "Wisuda Angkatan", category: "Kegiatan Rutin", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop", altText: "Wisuda angkatan", seoTitle: "Wisuda" },
  { name: "Kegiatan Pramuka", category: "Ekstrakurikuler", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop", altText: "Kegiatan pramuka", seoTitle: "Pramuka" },
  { name: "Kunjungan Museum", category: "Study Tour", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop", altText: "Kunjungan ke museum", seoTitle: "Kunjungan Museum" },
  { name: "Kompetisi Robotik", category: "Prestasi", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop", altText: "Kompetisi robotik", seoTitle: "Robotik" },
  { name: "Peringatan Hari Besar", category: "Keagamaan", url: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&h=600&fit=crop", altText: "Peringatan hari besar Islam", seoTitle: "Hari Besar" }
];

const DEFAULT_VIDEOS = [
  { title: "Profil SMP Muhammadiyah 35 Jakarta", description: "Video profil sekolah yang menampilkan fasilitas dan keunggulan", videoType: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Profil Sekolah", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" },
  { title: "Kegiatan Pembelajaran Virtual", description: "Dokumentasi pembelajaran daring selama pandemi", videoType: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Akademik", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" },
  { title: "Pentas Seni Tahunan 2024", description: "Penampilan siswa dalam acara pentas seni tahunan", videoType: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Ekstrakurikuler", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" },
];

const BASE_DEFAULT_NEWS = [
  {
    id: 1,
    title: 'Semarak Muhammadiyah Expo III 2025',
    slug: 'semarak-muhammadiyah-expo-iii-2025',
    channel: 'school',
    excerpt: 'SMP Muhammadiyah 35 Jakarta memeriahkan Milad Muhammadiyah ke-113 dengan stand inovasi pendidikan.',
    content: '<p>SMP Muhammadiyah 35 Jakarta turut memeriahkan agenda besar persyarikatan dalam rangka Milad Muhammadiyah ke-113...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40',
    authorId: 1,
    authorName: 'Super Admin',
    authorRole: 'Superadmin',
    category: 'Kegiatan',
    tags: 'Expo, Muhammadiyah, Milad',
    hashtags: ['#expo', '#muhammadiyah', '#milad'],
    seo: {
      focusKeyphrase: 'muhammadiyah expo 2025 jakarta',
      seoTitle: 'Semarak Muhammadiyah Expo III 2025 | SMP Muhammadiyah 35 Jakarta',
      slug: 'semarak-muhammadiyah-expo-iii-2025',
      metaDescription: 'SMP Muhammadiyah 35 Jakarta memeriahkan Milad Muhammadiyah ke-113 melalui stand inovasi pendidikan pada Muhammadiyah Expo III 2025.',
      readabilityScore: 80,
      seoScore: 72,
      keywordSuggestions: ['muhammadiyah expo', 'milad muhammadiyah', 'inovasi pendidikan', 'kegiatan sekolah', 'smp muhammadiyah 35 jakarta'],
      aiNotes: ['Pastikan keyphrase muncul di paragraf pertama', 'Tambahkan alt text pada gambar unggulan']
    },
    readTime: 6,
    status: 'published',
    createdAt: '2025-01-05T10:00:00Z',
    publishedAt: '2025-01-05T10:00:00Z'
  },
  {
    id: 2,
    title: 'Eduversal Mathematics Competition 2025',
    slug: 'eduversal-mathematics-competition-2025',
    channel: 'student',
    excerpt: 'Siswa SMP Muhammadiyah 35 Jakarta berhasil lolos ke babak final nasional.',
    content: '<p>Prestasi membanggakan kembali diraih oleh siswa SMP Muhammadiyah 35 Jakarta dalam ajang Eduversal Mathematics Competition...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7',
    authorId: 2,
    authorName: 'Admin Staff',
    authorRole: 'Admin',
    category: 'Prestasi',
    tags: 'Matematika, Kompetisi, Juara',
    hashtags: ['#matematika', '#kompetisi', '#juara'],
    seo: {
      focusKeyphrase: 'eduversal mathematics competition 2025',
      seoTitle: 'Eduversal Mathematics Competition 2025 | SMP Muhammadiyah 35 Jakarta',
      slug: 'eduversal-mathematics-competition-2025',
      metaDescription: 'Siswa SMP Muhammadiyah 35 Jakarta melaju ke babak final nasional Eduversal Mathematics Competition 2025 membawa prestasi membanggakan.',
      readabilityScore: 78,
      seoScore: 75,
      keywordSuggestions: ['kompetisi matematika', 'eduversal 2025', 'prestasi siswa', 'lomba matematika', 'smp muhammadiyah 35'],
      aiNotes: ['Sertakan keyphrase di heading H2', 'Perkuat CTA di akhir artikel']
    },
    readTime: 5,
    status: 'published',
    createdAt: '2025-01-15T09:00:00Z',
    publishedAt: '2025-01-15T09:00:00Z'
  }
];

const DEFAULT_NEWS = mergeNews(BASE_DEFAULT_NEWS, IMPORTED_NEWS);

export const db = {
  // --- HELPERS ---
  _getData: (key, defaultVal) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal)),
  _saveData: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

  // --- AUTHENTICATION ---
  login: () => {
    throw new Error('Deprecated: Use PHP API login (see src/lib/authApi.js)');
  },

  logout: () => {
    const session = db.getSession();
    if (session) db.logActivity(session.user.id, 'LOGOUT', `User ${session.user.email} logged out`);
    localStorage.removeItem('app_session');
  },

  getSession: () => {
    const sessionStr = localStorage.getItem('app_session');
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('app_session');
      return null;
    }
    return session;
  },

  // --- USERS (legacy local-only; not used) ---
  getUsers: () => db._getData('app_users', []),
  saveUser: () => { throw new Error('Deprecated: manage users via backend'); },
  deleteUser: () => { throw new Error('Deprecated: manage users via backend'); },

  // --- NEWS ---
  getNews: () => {
    const stored = db._getData('app_news', DEFAULT_NEWS);
    const merged = mergeNews(stored, IMPORTED_NEWS);
    return merged.sort((a, b) => {
      const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  },
  
  saveNews: (article, userId) => {
    const news = db.getNews();
    const now = new Date().toISOString();
    
    if (article.id) {
      const index = news.findIndex(n => n.id === article.id);
      news[index] = { ...news[index], ...article, updatedAt: now };
      if (article.status === 'published' && !news[index].publishedAt) {
        news[index].publishedAt = now;
      }
      db.logActivity(userId, 'UPDATE_NEWS', `Updated article: ${article.title}`);
    } else {
      article.id = Date.now();
      article.createdAt = now;
      article.updatedAt = now;
      if (article.status === 'published') article.publishedAt = now;
      news.push(article);
      db.logActivity(userId, 'CREATE_NEWS', `Created article: ${article.title}`);
    }
    db._saveData('app_news', news);
    return article;
  },

  deleteNews: (id, userId) => {
    const news = db.getNews().filter(n => n.id !== id);
    db._saveData('app_news', news);
    db.logActivity(userId, 'DELETE_NEWS', `Deleted article ID: ${id}`);
  },

  // --- GALLERY ---
  getGallery: () => normalizeOrder(db._getData(GALLERY_KEY, [])),

  saveGalleryItem: (fileData, userId) => {
    const current = db.getGallery();
    const uploadedAt = fileData.uploadedAt || new Date().toISOString();
    const filename = buildSeoFilename(fileData.name || fileData.filename, uploadedAt);
    const item = {
      ...fileData,
      id: fileData.id || Date.now(),
      name: fileData.name || fileData.filename || 'Galeri Sekolah',
      filename,
      seoTitle: fileData.seoTitle || fileData.name || 'Dokumentasi Sekolah',
      altText: fileData.altText || `${fileData.name || 'Foto'} SMP Muhammadiyah 35 Jakarta`,
      description: fileData.description || '',
      uploadedAt,
      order: typeof fileData.order === 'number' ? fileData.order : current.length,
    };
    const updated = normalizeOrder([...current, item]);
    db._saveData(GALLERY_KEY, updated);
    db.logActivity(userId, 'UPLOAD_GALLERY', `Uploaded gallery image: ${filename}`);
    return item;
  },

  renameGalleryItem: (id, newName, userId) => {
    const items = db.getGallery();
    const idx = items.findIndex((img) => img.id === id);
    if (idx === -1) return null;
    const item = items[idx];
    const filename = buildSeoFilename(newName, item.uploadedAt);
    items[idx] = { ...item, name: newName, filename };
    db._saveData(GALLERY_KEY, items);
    db.logActivity(userId, 'RENAME_GALLERY', `Renamed gallery image to ${filename}`);
    return items[idx];
  },

  deleteGalleryItem: (id, userId) => {
    const items = db.getGallery().filter((img) => img.id !== id);
    db._saveData(GALLERY_KEY, normalizeOrder(items));
    db.logActivity(userId, 'DELETE_GALLERY', `Deleted gallery image ID: ${id}`);
  },

  reorderGallery: (orderedItems = [], userId) => {
    const normalized = normalizeOrder(orderedItems.map((item, idx) => ({ ...item, order: idx })));
    db._saveData(GALLERY_KEY, normalized);
    db.logActivity(userId, 'REORDER_GALLERY', 'Updated gallery order');
    return normalized;
  },

  // --- MEDIA ---
  getMedia: () => db._getData('app_media', []),
  
  saveMedia: (fileData, userId) => {
    const media = db.getMedia();
    fileData.id = Date.now();
    fileData.uploadedBy = userId;
    fileData.createdAt = new Date().toISOString();
    media.unshift(fileData);
    db._saveData('app_media', media);
    db.logActivity(userId, 'UPLOAD_MEDIA', `Uploaded file: ${fileData.fileName}`);
    return fileData;
  },

  deleteMedia: (id, userId) => {
    const media = db.getMedia().filter(m => m.id !== id);
    db._saveData('app_media', media);
    db.logActivity(userId, 'DELETE_MEDIA', `Deleted media ID: ${id}`);
  },

  // --- STAFF ---
  getStaffProfiles: () => normalizeOrder(db._getData(STAFF_KEY, [])),

  saveStaffProfile: (profile, userId) => {
    const current = db.getStaffProfiles();
    const now = new Date().toISOString();
    if (profile.id) {
      const idx = current.findIndex((p) => p.id === profile.id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], ...profile, updatedAt: now };
      }
    } else {
      current.push({
        ...profile,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
        order: typeof profile.order === 'number' ? profile.order : current.length,
      });
    }
    const normalized = normalizeOrder(current);
    db._saveData(STAFF_KEY, normalized);
    db.logActivity(userId, 'UPSERT_STAFF', `Saved staff profile: ${profile.name}`);
    return normalized;
  },

  deleteStaffProfile: (id, userId) => {
    const filtered = db.getStaffProfiles().filter((p) => p.id !== id);
    db._saveData(STAFF_KEY, normalizeOrder(filtered));
    db.logActivity(userId, 'DELETE_STAFF', `Deleted staff profile ID: ${id}`);
  },

  reorderStaffProfiles: (orderedProfiles = [], userId) => {
    const normalized = normalizeOrder(orderedProfiles.map((p, idx) => ({ ...p, order: idx })));
    db._saveData(STAFF_KEY, normalized);
    db.logActivity(userId, 'REORDER_STAFF', 'Updated staff order');
    return normalized;
  },

  importDefaultStaff: (userId) => {
    const current = db.getStaffProfiles();
    if (current.length > 0) return current;
    const now = new Date().toISOString();
    const imported = DEFAULT_STAFF.map((staff, idx) => ({
      ...staff,
      id: Date.now() + idx,
      photo: staff.image,
      createdAt: now,
      updatedAt: now,
      order: idx
    }));
    db._saveData(STAFF_KEY, imported);
    db.logActivity(userId, 'IMPORT_STAFF', `Imported ${imported.length} default staff profiles`);
    return imported;
  },

  importDefaultGallery: (userId) => {
    const current = db.getGallery();
    const now = new Date().toISOString();
    const imported = DEFAULT_GALLERY.map((photo, idx) => ({
      ...photo,
      id: Date.now() + idx,
      dataUrl: photo.url,
      originalUrl: photo.url,
      filename: buildSeoFilename(photo.name, now),
      uploadedAt: now,
      order: current.length + idx
    }));
    const merged = normalizeOrder([...current, ...imported]);
    db._saveData(GALLERY_KEY, merged);
    db.logActivity(userId, 'IMPORT_GALLERY', `Imported ${imported.length} default gallery images`);
    return merged;
  },

  // --- VIDEOS ---
  getVideos: () => normalizeOrder(db._getData(VIDEO_KEY, [])),

  saveVideo: (video, userId) => {
    const current = db.getVideos();
    const now = new Date().toISOString();
    if (video.id) {
      const idx = current.findIndex((v) => v.id === video.id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], ...video, updatedAt: now };
      }
    } else {
      current.push({
        ...video,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
        order: typeof video.order === 'number' ? video.order : current.length,
      });
    }
    const normalized = normalizeOrder(current);
    db._saveData(VIDEO_KEY, normalized);
    db.logActivity(userId, 'UPSERT_VIDEO', `Saved video: ${video.title}`);
    return normalized;
  },

  deleteVideo: (id, userId) => {
    const filtered = db.getVideos().filter((v) => v.id !== id);
    db._saveData(VIDEO_KEY, normalizeOrder(filtered));
    db.logActivity(userId, 'DELETE_VIDEO', `Deleted video ID: ${id}`);
  },

  reorderVideos: (orderedVideos = [], userId) => {
    const normalized = normalizeOrder(orderedVideos.map((v, idx) => ({ ...v, order: idx })));
    db._saveData(VIDEO_KEY, normalized);
    db.logActivity(userId, 'REORDER_VIDEOS', 'Updated video order');
    return normalized;
  },

  importDefaultVideos: (userId) => {
    const current = db.getVideos();
    const now = new Date().toISOString();
    const imported = DEFAULT_VIDEOS.map((video, idx) => ({
      ...video,
      id: Date.now() + idx,
      createdAt: now,
      updatedAt: now,
      order: current.length + idx
    }));
    const merged = normalizeOrder([...current, ...imported]);
    db._saveData(VIDEO_KEY, merged);
    db.logActivity(userId, 'IMPORT_VIDEOS', `Imported ${imported.length} default videos`);
    return merged;
  },

  formatName,

  // --- REGISTRANTS (server-backed; no browser storage) ---
  getRegistrants: async () => {
    const resp = await fetch('/api/ppdb/list.php');
    const json = await resp.json();
    if (!resp.ok || !json.success) return [];
    return json.data?.items || [];
  },

  saveRegistrant: async (data) => {
    const resp = await fetch('/api/ppdb/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await resp.json();
    if (!resp.ok || !json.success) throw new Error(json.message || 'Save failed');
    return json.data;
  },

  deleteRegistrant: async (id, userId) => {
    const resp = await fetch('/api/ppdb/delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const json = await resp.json();
    if (!resp.ok || !json.success) throw new Error(json.message || 'Delete failed');
    db.logActivity(userId, 'DELETE_REGISTRANT', `Deleted registrant ID: ${id}`);
    return true;
  },

  // --- SETTINGS ---
  getSettings: () => db._getData('app_settings', DEFAULT_SETTINGS),
  
  saveSettings: (settings, userId) => {
    db._saveData('app_settings', settings);
    db.logActivity(userId, 'UPDATE_SETTINGS', 'System settings updated');
  },

  // --- LOGS ---
  getLogs: () => db._getData('app_logs', []),
  
  logActivity: (userId, action, description) => {
    const logs = db.getLogs();
    logs.unshift({
      id: Date.now(),
      userId,
      action,
      description,
      timestamp: new Date().toISOString()
    });
    if (logs.length > 100) logs.pop();
    db._saveData('app_logs', logs);
  }
};