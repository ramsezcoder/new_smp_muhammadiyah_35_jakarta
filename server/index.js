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
    // Check if user is superadmin
    const superadminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (superadminToken !== 'SuperAdmin@2025') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, error: 'Unauthorized. Only superadmin can upload.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `gallery-${timestamp}-${Math.random().toString(36).substr(2, 9)}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    // Convert and compress image to WebP
    await sharp(req.file.path)
      .resize(1200, 900, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        url: `/uploads/gallery/${filename}`,
        filename,
        size: (await fs.promises.stat(outputPath)).size,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('[api] upload failed', err.message);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
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
