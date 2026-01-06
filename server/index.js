const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Helpers
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509062522246-3755977927d7';
const IMPORT_PATH = path.resolve(__dirname, '..', 'src', 'data', 'importedPosts.json');
const PDF_VIEWS_PATH = path.resolve(__dirname, 'data', 'pdf-views.json');

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const extractFirstImage = (html = '') => {
  const match = html.match(/<img[^>]+src=["']([^"'>\s]+)["']/i);
  return match?.[1] || '';
};
const computeReadTime = (html = '') => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.min(15, Math.round(words / 200) || 2));
};

const loadImportedNews = () => {
  try {
    const raw = fs.readFileSync(IMPORT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[api] Cannot read importedPosts.json', err.message);
    return [];
  }
};

const normalizeNews = (items = []) => {
  return items
    .filter(n => n?.title)
    .map((n, idx) => {
      const slug = n.slug || n.seo?.slug || `news-${idx}`;
      const firstImg = extractFirstImage(n.content || '');
      const image = n.featuredImage || firstImg || FALLBACK_IMAGE;
      const channel = n.channel || 'school';
      const createdAt = n.createdAt || n.createdDate || new Date().toISOString();
      return {
        id: n.id || slug,
        title: n.title,
        slug,
        content: n.content || '',
        excerpt: n.excerpt || stripHtml(n.content || '').slice(0, 180),
        featuredImage: image,
        category: n.category || 'Berita',
        channel,
        createdAt,
        readTime: n.readTime || computeReadTime(n.content || ''),
        author: n.authorName || n.author || 'Redaksi'
      };
    });
};

const ensurePdfViewsFile = () => {
  const dir = path.dirname(PDF_VIEWS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(PDF_VIEWS_PATH)) fs.writeFileSync(PDF_VIEWS_PATH, '{}', 'utf8');
};

const loadPdfViews = () => {
  try {
    ensurePdfViewsFile();
    const raw = fs.readFileSync(PDF_VIEWS_PATH, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('[api] Cannot read pdf-views.json', err.message);
    return {};
  }
};

const savePdfViews = (data = {}) => {
  try {
    ensurePdfViewsFile();
    fs.writeFileSync(PDF_VIEWS_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[api] Cannot write pdf-views.json', err.message);
  }
};

// JSON persistence for gallery/staff/videos
const DATA_DIR = path.resolve(__dirname, '..', 'src', 'data');
const GALLERY_JSON = path.join(DATA_DIR, 'gallery.json');
const STAFF_JSON = path.join(DATA_DIR, 'staff.json');
const VIDEOS_JSON = path.join(DATA_DIR, 'videos.json');
const IMPORT_FLAGS_JSON = path.join(DATA_DIR, 'import-flags.json');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const readJSON = (file, fallback) => {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.warn('[api] readJSON failed', file, e.message);
    return fallback;
  }
};
const writeJSON = (file, data) => {
  try {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.warn('[api] writeJSON failed', file, e.message);
    return false;
  }
};
const slugify = (text = '') => String(text)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .substring(0, 80);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://peachpuff-porcupine-369154.hostingersite.com'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve built frontend in production
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Serve public uploads
const publicPath = path.resolve(__dirname, '..', 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Disable caching for API routes
app.use('/api/*', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const verifyRecaptchaRouter = require('./api/verify-recaptcha');
app.use('/api', verifyRecaptchaRouter);

app.get('/api/news/list', (req, res) => {
  try {
    const category = req.query.category === 'student' ? 'student' : 'school';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 9);

    const newsItems = normalizeNews(loadImportedNews()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filtered = newsItems.filter(n => (category ? n.channel === category : true));
    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    res.json({
      success: true,
      data: paged,
      items: paged,
      totalPages,
      totalRecords,
      page,
      pageSize: limit
    });
  } catch (err) {
    console.warn('[api] news list failed', err.message);
    res.status(500).json({ success: false, message: 'Failed to load news', error: err.message });
  }
});

app.get('/api/news/detail/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ success: false, error: 'Missing slug' });

    const newsItems = loadImportedNews();
    let found = newsItems.find(n => (n.seo?.slug || n.slug) === slug);
    
    if (!found) {
      found = newsItems.find(n => String(n.id) === slug);
    }

    if (!found) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const normalized = normalizeNews([found])[0];
    const fullArticle = {
      ...normalized,
      content: found.content || '',
      tags: found.tags || '',
      hashtags: found.hashtags || [],
      seo: found.seo || {},
      authorName: found.authorName || found.author || 'Redaksi',
      authorRole: found.authorRole || 'Staff',
      publishedAt: found.publishedAt || found.createdAt || new Date().toISOString(),
      updatedAt: found.updatedAt || found.publishedAt || found.createdAt || new Date().toISOString()
    };

    res.json({
      success: true,
      record: fullArticle,
      data: fullArticle,
      article: fullArticle
    });
  } catch (err) {
    console.warn('[api] news detail failed', err.message);
    res.status(500).json({ success: false, message: 'Failed to load article', error: err.message });
  }
});

app.get('/api/pdf/views', (req, res) => {
  try {
    const views = loadPdfViews();
    res.json({ success: true, views });
  } catch (err) {
    console.warn('[api] pdf views read failed', err.message);
    res.status(500).json({ success: false, message: 'Failed to load views' });
  }
});

const incrementPdfView = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Missing pdf id' });

    const views = loadPdfViews();
    const current = views[id] || { pdfId: id, fileName: req.body?.fileName || '', viewCount: 0, lastOpened: null };
    const updated = {
      ...current,
      pdfId: id,
      fileName: req.body?.fileName || current.fileName,
      viewCount: (current.viewCount || 0) + 1,
      lastOpened: new Date().toISOString()
    };

    views[id] = updated;
    savePdfViews(views);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.warn('[api] pdf view increment failed', err.message);
    res.status(500).json({ success: false, message: 'Failed to increment view' });
  }
};

app.post('/api/pdf/view/:id', incrementPdfView);
app.patch('/api/pdf/view/:id', incrementPdfView);

// Gallery upload endpoint
const UPLOAD_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'gallery');
const TEMP_DIR = path.resolve(__dirname, 'temp');

// Ensure directories exist
[UPLOAD_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
    }
  }
});

app.post('/api/upload/gallery', upload.single('file'), async (req, res) => {
  try {
    const superadminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (superadminToken !== 'SuperAdmin@2025') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, error: 'Unauthorized. Only superadmin can upload.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const baseName = slugify(req.body?.name || path.basename(req.file.originalname, path.extname(req.file.originalname)));
    const filename = `${baseName}-${Date.now()}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.path)
      .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(req.file.path);

    const fileUrl = `/uploads/gallery/${filename}`;
    const gallery = readJSON(GALLERY_JSON, []);
    if (Array.isArray(gallery) && gallery.find(g => g.url === fileUrl)) {
      return res.status(409).json({ success: false, error: 'Duplicate file' });
    }
    const item = {
      id: `gal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      filename,
      url: fileUrl,
      name: baseName,
      altText: req.body?.altText || baseName,
      seoTitle: req.body?.seoTitle || baseName,
      description: req.body?.description || '',
      uploadedAt: new Date().toISOString(),
      order: (gallery?.length || 0) + 1
    };
    const next = Array.isArray(gallery) ? [...gallery, item] : [item];
    writeJSON(GALLERY_JSON, next);

    res.json({ success: true, item });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('[api] upload failed', err.message);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// Gallery list
app.get('/api/gallery', (req, res) => {
  const gallery = readJSON(GALLERY_JSON, []);
  res.json({ success: true, items: Array.isArray(gallery) ? gallery : [] });
});

// Gallery delete (physical file + JSON record)
app.delete('/api/gallery/:id', (req, res) => {
  const id = req.params.id;
  const gallery = readJSON(GALLERY_JSON, []);
  const idx = gallery.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  const item = gallery[idx];
  const publicRoot = path.resolve(__dirname, '..', 'public');
  const absPath = path.join(publicRoot, item.url.replace(/^\//, ''));
  try { if (fs.existsSync(absPath)) fs.unlinkSync(absPath); } catch (e) { console.warn('[api] delete file failed', e.message); }
  const next = [...gallery.slice(0, idx), ...gallery.slice(idx + 1)].map((g, i) => ({ ...g, order: i + 1 }));
  writeJSON(GALLERY_JSON, next);
  res.json({ success: true });
});

// Gallery update SEO metadata and display name (no physical rename)
app.patch('/api/gallery/:id', (req, res) => {
  const id = req.params.id;
  const { name, altText, seoTitle, description } = req.body || {};
  const gallery = readJSON(GALLERY_JSON, []);
  const idx = gallery.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  const base = name ? slugify(name) : gallery[idx].name;
  gallery[idx] = {
    ...gallery[idx],
    name: base,
    altText: altText ?? gallery[idx].altText,
    seoTitle: seoTitle ?? gallery[idx].seoTitle,
    description: description ?? gallery[idx].description
  };
  writeJSON(GALLERY_JSON, gallery);
  res.json({ success: true, item: gallery[idx] });
});

// Gallery reorder via ids array
app.post('/api/gallery/reorder', (req, res) => {
  const order = req.body?.order;
  if (!Array.isArray(order)) return res.status(400).json({ success: false, error: 'Invalid order' });
  const gallery = readJSON(GALLERY_JSON, []);
  const map = new Map(order.map((id, idx) => [id, idx + 1]));
  const next = gallery.map(g => ({ ...g, order: map.get(g.id) || g.order })).sort((a, b) => a.order - b.order);
  writeJSON(GALLERY_JSON, next);
  res.json({ success: true });
});

// Staff upload (WebP) and persistence
const STAFF_UPLOAD_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'staff');
ensureDir(STAFF_UPLOAD_DIR);
const staffUpload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

app.post('/api/upload/staff', staffUpload.single('file'), async (req, res) => {
  try {
    const superadminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (superadminToken !== 'SuperAdmin@2025') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, error: 'Unauthorized. Only superadmin can upload.' });
    }
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const baseName = slugify(req.body?.name || path.basename(req.file.originalname, path.extname(req.file.originalname)));
    const filename = `${baseName}-${Date.now()}.webp`;
    const outputPath = path.join(STAFF_UPLOAD_DIR, filename);
    await sharp(req.file.path).resize(800, 800, { fit: 'cover' }).webp({ quality: 80 }).toFile(outputPath);
    fs.unlinkSync(req.file.path);
    const fileUrl = `/uploads/staff/${filename}`;
    const staff = readJSON(STAFF_JSON, []);
    const item = {
      id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: req.body?.name || baseName,
      role: req.body?.role || '',
      photoUrl: fileUrl,
      uploadedAt: new Date().toISOString(),
      order: (staff?.length || 0) + 1,
      active: true
    };
    writeJSON(STAFF_JSON, Array.isArray(staff) ? [...staff, item] : [item]);
    res.json({ success: true, item });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('[api] staff upload failed', err.message);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

app.get('/api/staff', (req, res) => {
  const staff = readJSON(STAFF_JSON, []);
  res.json({ success: true, items: Array.isArray(staff) ? staff : [] });
});

app.patch('/api/staff/:id', (req, res) => {
  const id = req.params.id;
  const staff = readJSON(STAFF_JSON, []);
  const idx = staff.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  staff[idx] = { ...staff[idx], ...req.body };
  writeJSON(STAFF_JSON, staff);
  res.json({ success: true, item: staff[idx] });
});

app.delete('/api/staff/:id', (req, res) => {
  const id = req.params.id;
  const staff = readJSON(STAFF_JSON, []);
  const idx = staff.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  const item = staff[idx];
  const publicRoot = path.resolve(__dirname, '..', 'public');
  const absPath = path.join(publicRoot, item.photoUrl.replace(/^\//, ''));
  try { if (fs.existsSync(absPath)) fs.unlinkSync(absPath); } catch (e) { console.warn('[api] delete staff file failed', e.message); }
  const next = [...staff.slice(0, idx), ...staff.slice(idx + 1)].map((s, i) => ({ ...s, order: i + 1 }));
  writeJSON(STAFF_JSON, next);
  res.json({ success: true });
});

app.post('/api/staff/reorder', (req, res) => {
  const order = req.body?.order;
  if (!Array.isArray(order)) return res.status(400).json({ success: false, error: 'Invalid order' });
  const staff = readJSON(STAFF_JSON, []);
  const map = new Map(order.map((id, idx) => [id, idx + 1]));
  const next = staff.map(s => ({ ...s, order: map.get(s.id) || s.order })).sort((a, b) => a.order - b.order);
  writeJSON(STAFF_JSON, next);
  res.json({ success: true });
});

// Featured image upload with enforced rename + WebP, reject SVG, <=4MB
app.post('/api/upload/featured', upload.single('file'), async (req, res) => {
  try {
    const superadminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (superadminToken !== 'SuperAdmin@2025') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, error: 'Unauthorized. Only superadmin can upload.' });
    }
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const baseName = slugify(req.body?.customName || path.basename(req.file.originalname, path.extname(req.file.originalname)));
    const filename = `${baseName}-${Date.now()}.webp`;
    const NEWS_UPLOAD_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'news');
    ensureDir(NEWS_UPLOAD_DIR);
    const outputPath = path.join(NEWS_UPLOAD_DIR, filename);
    await sharp(req.file.path).resize(1600, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
    fs.unlinkSync(req.file.path);
    const fileUrl = `/uploads/news/${filename}`;
    res.json({ success: true, file: fileUrl, alt: req.body?.alt || baseName, title: req.body?.title || baseName });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('[api] featured upload failed', err.message);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// Videos APIs: list, add, delete, reorder
app.get('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_JSON, []);
  res.json({ success: true, items: Array.isArray(videos) ? videos : [] });
});

app.post('/api/videos/add', (req, res) => {
  const { title, videoType, url } = req.body || {};
  if (!title || !videoType || !url) return res.status(400).json({ success: false, error: 'Missing fields' });
  const videos = readJSON(VIDEOS_JSON, []);
  const thumb = videoType === 'youtube' ? `https://img.youtube.com/vi/${(url.split('v=')[1] || '').split('&')[0]}/hqdefault.jpg` : '';
  const item = {
    id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    videoType,
    url,
    thumbnail: thumb,
    order: (videos?.length || 0) + 1,
    createdAt: new Date().toISOString()
  };
  writeJSON(VIDEOS_JSON, Array.isArray(videos) ? [...videos, item] : [item]);
  res.json({ success: true, item });
});

app.delete('/api/videos/:id', (req, res) => {
  const id = req.params.id;
  const videos = readJSON(VIDEOS_JSON, []);
  const idx = videos.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  const next = [...videos.slice(0, idx), ...videos.slice(idx + 1)].map((v, i) => ({ ...v, order: i + 1 }));
  writeJSON(VIDEOS_JSON, next);
  res.json({ success: true });
});

app.post('/api/videos/reorder', (req, res) => {
  const order = req.body?.order;
  if (!Array.isArray(order)) return res.status(400).json({ success: false, error: 'Invalid order' });
  const videos = readJSON(VIDEOS_JSON, []);
  const map = new Map(order.map((id, idx) => [id, idx + 1]));
  const next = videos.map(v => ({ ...v, order: map.get(v.id) || v.order })).sort((a, b) => a.order - b.order);
  writeJSON(VIDEOS_JSON, next);
  res.json({ success: true });
});

// Import-default endpoints with idempotence flags
app.post('/api/gallery/import-default', (req, res) => {
  const flags = readJSON(IMPORT_FLAGS_JSON, {});
  if (flags.galleryDefaultImported) return res.json({ success: true, skipped: true });
  const defaults = [
    { filename: 'kegiatan-belajar.webp', url: '/assets/upload_media/school/kegiatan-belajar.webp', name: 'kegiatan-belajar' },
    { filename: 'upacara-bendera.webp', url: '/assets/upload_media/school/upacara-bendera.webp', name: 'upacara-bendera' },
  ];
  const gallery = readJSON(GALLERY_JSON, []);
  const existingUrls = new Set(gallery.map(g => g.url));
  const toAdd = defaults.filter(d => !existingUrls.has(d.url)).map((d, idx) => ({
    id: `gal_${Date.now()}_${idx}`,
    filename: d.filename,
    url: d.url,
    name: d.name,
    altText: d.name,
    seoTitle: d.name,
    description: '',
    uploadedAt: new Date().toISOString(),
    order: (gallery?.length || 0) + idx + 1,
  }));
  writeJSON(GALLERY_JSON, [...gallery, ...toAdd]);
  flags.galleryDefaultImported = true;
  writeJSON(IMPORT_FLAGS_JSON, flags);
  res.json({ success: true, added: toAdd.length });
});

app.post('/api/videos/import-default', (req, res) => {
  const flags = readJSON(IMPORT_FLAGS_JSON, {});
  if (flags.videosDefaultImported) return res.json({ success: true, skipped: true });
  const defaults = [
    { title: 'Profil Sekolah', videoType: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  ];
  const videos = readJSON(VIDEOS_JSON, []);
  const existingUrls = new Set(videos.map(v => v.url));
  const toAdd = defaults.filter(d => !existingUrls.has(d.url)).map((d, idx) => ({
    id: `vid_${Date.now()}_${idx}`,
    title: d.title,
    videoType: d.videoType,
    url: d.url,
    thumbnail: `https://img.youtube.com/vi/${(d.url.split('v=')[1] || '').split('&')[0]}/hqdefault.jpg`,
    order: (videos?.length || 0) + idx + 1,
    createdAt: new Date().toISOString(),
  }));
  writeJSON(VIDEOS_JSON, [...videos, ...toAdd]);
  flags.videosDefaultImported = true;
  writeJSON(IMPORT_FLAGS_JSON, flags);
  res.json({ success: true, added: toAdd.length });
});

// Staff import-default with idempotence
app.post('/api/staff/import-default', (req, res) => {
  const flags = readJSON(IMPORT_FLAGS_JSON, {});
  if (flags.staffDefaultImported) return res.json({ success: true, skipped: true });

  const defaults = [
    { name: 'R. Agung Budi Laksono', position: 'Waka Sarpras', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop' },
    { name: 'Rubiyatun', position: 'Waka Kesiswaan', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop' },
    { name: 'Istiana', position: 'Waka Kurikulum', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop' },
    { name: 'Rini Yuni Astuti', position: 'Waka Humas', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop' },
    { name: 'Suparliyanto', position: 'PLT Kasubag TU', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
    { name: 'Sri Rahayu', position: 'Guru Kimia', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop' },
    { name: 'Boini', position: 'Guru Matematika', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop' },
    { name: 'Arief Teguh Rahardjo', position: 'Guru Matematika', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop' },
    { name: 'Dahrotun', position: 'Guru Bahasa Indonesia', image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop' },
    { name: 'Dwijatno Hamardianto', position: 'Guru BK', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop' },
    { name: 'Agus Soedarsono', position: 'Guru Matematika', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop' },
    { name: 'Rahayu Wuryaningsih', position: 'Guru Bahasa Jawa', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' },
  ];
  const staff = readJSON(STAFF_JSON, []);
  const existingNames = new Set(staff.map(s => `${s.name}|${s.role || s.position || ''}`));
  const toAdd = defaults
    .filter(d => !existingNames.has(`${d.name}|${d.position}`))
    .map((d, idx) => ({
      id: `stf_${Date.now()}_${idx}`,
      name: d.name,
      role: d.position,
      photoUrl: d.image,
      uploadedAt: new Date().toISOString(),
      order: (staff?.length || 0) + idx + 1,
      active: true
    }));

  writeJSON(STAFF_JSON, [...staff, ...toAdd]);
  flags.staffDefaultImported = true;
  writeJSON(IMPORT_FLAGS_JSON, flags);
  res.json({ success: true, added: toAdd.length });
});

// SPA fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (fs.existsSync(distPath)) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  return next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  SMP Muhammadiyah 35 Jakarta - Backend  ║`);
  console.log(`║  Server running on port ${PORT}            ║`);
  console.log(`║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)}║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  
  if (!process.env.DB_URL) {
    console.warn('[INFO] Using file-based storage for news/pdf analytics');
  }
  
  console.log('Routes:');
  console.log('  ✓ GET  /health');
  console.log('  ✓ GET  /api/news/list');
  console.log('  ✓ GET  /api/news/detail/:slug');
  console.log('  ✓ GET  /api/pdf/views');
  console.log('  ✓ POST /api/pdf/view/:id');
  console.log('  ✓ POST /api/upload/gallery');
  console.log('  ✓ *    (SPA fallback to index.html)\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[INFO] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[INFO] Server closed');
    process.exit(0);
  });
});

module.exports = app;
