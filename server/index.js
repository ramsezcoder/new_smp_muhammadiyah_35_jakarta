const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
        excerpt: n.excerpt || stripHtml(n.content || '').slice(0, 180),
        image,
        category: n.category || 'Berita',
        channel,
        createdAt,
        readTime: n.readTime || computeReadTime(n.content || ''),
        author: n.authorName || 'Redaksi'
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
  const category = req.query.category === 'student' ? 'student' : 'school';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 9);

  const newsItems = normalizeNews(loadImportedNews()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = newsItems.filter(n => category ? n.channel === category : true);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  res.json({
    total,
    page,
    pageSize: limit,
    totalPages,
    items: paged
  });
});

app.get('/api/pdf/views', (req, res) => {
  const views = loadPdfViews();
  res.json({ views });
});

app.patch('/api/pdf/view/:id', (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing pdf id' });

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
  res.json(updated);
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
