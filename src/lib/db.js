// Simulation of a Database Layer using LocalStorage
// Abstracts data access to resemble a MySQL schema structure
import importedPosts from '@/data/importedPosts.json';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509062522246-3755977927d7';

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

const DEFAULT_USERS = [
  { id: 1, email: 'superadmin@smpmuh35.id', password: 'SuperAdmin@2025', name: 'Super Admin', role: 'Superadmin', status: 'active', lastLogin: null },
  { id: 2, email: 'admin@smpmuh35.id', password: 'Admin@2025', name: 'Admin Staff', role: 'Admin', status: 'active', lastLogin: null },
  { id: 3, email: 'postmaker@smpmuh35.id', password: 'PostMaker@2025', name: 'Content Creator', role: 'Post Maker', status: 'active', lastLogin: null },
];

const DEFAULT_SETTINGS = {
  siteName: 'SMP Muhammadiyah 35 Jakarta',
  email: 'info@smpmuh35jakarta.sch.id',
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
  login: (email, password) => {
    const users = db._getData('app_users', DEFAULT_USERS);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.status !== 'active') throw new Error('Account is disabled');
      
      const session = {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: 'jwt-' + Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000)
      };
      localStorage.setItem('app_session', JSON.stringify(session));
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      db.saveUser(user);
      db.logActivity(user.id, 'LOGIN', `User ${user.email} logged in`);
      
      return session;
    }
    throw new Error('Invalid credentials');
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

  // --- USERS ---
  getUsers: () => db._getData('app_users', DEFAULT_USERS),
  
  saveUser: (userData) => {
    const users = db.getUsers();
    if (userData.id) {
      const index = users.findIndex(u => u.id === userData.id);
      users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    } else {
      userData.id = Date.now();
      userData.status = userData.status || 'active';
      userData.createdAt = new Date().toISOString();
      users.push(userData);
    }
    db._saveData('app_users', users);
  },

  deleteUser: (id) => {
    const users = db.getUsers().filter(u => u.id !== id);
    db._saveData('app_users', users);
  },

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

  // --- REGISTRANTS ---
  getRegistrants: () => db._getData('registrants', []),
  
  saveRegistrant: (data) => {
    const regs = db.getRegistrants();
    if(data.id) {
        const index = regs.findIndex(r => r.id === data.id);
        regs[index] = { ...regs[index], ...data, updatedAt: new Date().toISOString() };
    } else {
        data.id = Date.now();
        data.status = 'new';
        data.createdAt = new Date().toISOString();
        regs.push(data);
    }
    db._saveData('registrants', regs);
  },

  deleteRegistrant: (id, userId) => {
    const regs = db.getRegistrants().filter(r => r.id !== id);
    db._saveData('registrants', regs);
    db.logActivity(userId, 'DELETE_REGISTRANT', `Deleted registrant ID: ${id}`);
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