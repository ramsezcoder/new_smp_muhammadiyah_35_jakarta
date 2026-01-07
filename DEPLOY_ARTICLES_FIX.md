# 🚀 Deploy Articles API Fix - Step by Step

## ✅ What Was Fixed

### Backend (PHP):
1. **Created `/api/articles/upload_image.php`** - Dedicated image upload endpoint
   - Validates file type (JPG, PNG, WebP)
   - Validates file size (max 4MB)
   - Stores images in `/uploads/articles/`
   - Returns JSON with filename and URL

2. **Improved `/api/articles/list.php`**:
   - Safe status parameter handling (all/draft/pending/published/archived)
   - Proper PDO::FETCH_ASSOC mode
   - Safe JSON decode for tags_json
   - Better error logging
   - Fixed SQL query for different status filters

### Frontend (React):
3. **Fixed RTL text issue** - Added `dir="ltr"` to ALL text inputs:
   - Title input
   - Search input
   - SEO Title input
   - Slug input
   - Content editor (RichTextEditor)
   - Excerpt textarea
   - Meta description textarea

4. **New bundle**: `index-e23e74af.js` (replaces index-455ae079.js)

---

## 📤 DEPLOYMENT STEPS

### Step 1: Upload Backend Files to Hostinger

Upload these **3 files** via File Manager or FTP to `public_html/`:

#### File 1: `public/api/articles/list.php`
**Location on server**: `public_html/api/articles/list.php`

**Full content**:
```php
<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Ensure articles table exists
$pdo->exec('CREATE TABLE IF NOT EXISTS articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content_html MEDIUMTEXT NOT NULL,
  excerpt TEXT DEFAULT NULL,
  featured_image VARCHAR(255) DEFAULT NULL,
  featured_image_alt VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  tags_json VARCHAR(500) DEFAULT NULL,
  status ENUM("draft","pending","published","archived") NOT NULL DEFAULT "draft",
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description VARCHAR(255) DEFAULT NULL,
  og_image VARCHAR(255) DEFAULT NULL,
  author_id INT UNSIGNED DEFAULT NULL,
  author_name VARCHAR(255) DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_sort (sort_order),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$statusParam = trim((string)($_GET['status'] ?? 'published'));

// Validate status parameter
$allowedStatuses = ['all', 'draft', 'pending', 'published', 'archived'];
$status = in_array($statusParam, $allowedStatuses, true) ? $statusParam : 'published';
$publishedOnly = $status === 'published';

$where = $publishedOnly ? 'WHERE status = "published"' : ($status === 'all' ? '' : 'WHERE status = ?');

try {
  // Get total count
  if ($status === 'all') {
    $total = (int)$pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn();
  } elseif ($publishedOnly) {
    $total = (int)$pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'published'")->fetchColumn();
  } else {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE status = ?");
    $stmt->execute([$status]);
    $total = (int)$stmt->fetchColumn();
  }
  
  // Get items
  $sql = "SELECT id, title, slug, excerpt, featured_image, featured_image_alt, category, tags_json, status, seo_title, seo_description, author_name, published_at, created_at
          FROM articles $where ORDER BY sort_order DESC, published_at DESC, id DESC LIMIT :limit OFFSET :offset";
  $stmt = $pdo->prepare($sql);
  if (!$publishedOnly && $status !== 'all') {
    $stmt->bindValue(1, $status, PDO::PARAM_STR);
  }
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  $baseUrl = '/uploads/articles';
  foreach ($items as &$it) {
    $it['featured_image_url'] = $it['featured_image'] ? $baseUrl . '/' . $it['featured_image'] : null;
    $it['tags'] = [];
    if (!empty($it['tags_json'])) {
      $decoded = json_decode($it['tags_json'], true);
      $it['tags'] = is_array($decoded) ? $decoded : [];
    }
  }
  unset($it);
  
  respond(true, '', [
    'items' => $items,
    'pagination' => [
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'pages' => (int)ceil($total / $limit)
    ]
  ]);
} catch (Throwable $e) {
  error_log("Articles list.php error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
  respond(false, 'Failed to list articles', ['error' => $e->getMessage()], 500);
}
```

---

#### File 2: `public/api/articles/upload_image.php` ⭐ NEW FILE
**Location on server**: `public_html/api/articles/upload_image.php`

**Full content**:
```php
<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(false, 'Invalid method', [], 405);
}

// Check if file was uploaded
if (!isset($_FILES['featured_image'])) {
  respond(false, 'No file uploaded', [], 400);
}

$file = $_FILES['featured_image'];

// Validate MIME type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes, true)) {
  respond(false, 'Invalid file type. Only JPG, PNG, and WebP allowed', [], 400);
}

// Validate file size (max 4MB)
if ($file['size'] > 4 * 1024 * 1024) {
  respond(false, 'File too large. Maximum 4MB allowed', [], 400);
}

// Generate unique filename
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$filename = uniqid('img_', true) . '.' . $ext;

// Ensure upload directory exists
$uploadDir = __DIR__ . '/../../uploads/articles';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

$destination = $uploadDir . '/' . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $destination)) {
  respond(false, 'Failed to save file', [], 500);
}

// Return success with file info
respond(true, 'Image uploaded successfully', [
  'filename' => $filename,
  'url' => '/uploads/articles/' . $filename
]);
```

---

### Step 2: Upload Frontend Files to Hostinger

Upload the **entire contents** of the `dist/` folder:

1. **Delete old bundle** from server:
   - Delete: `public_html/assets/index-455ae079.js`

2. **Upload new files**:
   - Upload: `dist/index.html` → `public_html/index.html` (overwrite)
   - Upload: `dist/assets/index-e23e74af.js` → `public_html/assets/index-e23e74af.js` ⭐ NEW
   - Upload: `dist/assets/index-7db43151.css` → `public_html/assets/index-7db43151.css`

---

### Step 3: Clear Cache

1. **Browser Cache**: Press `Ctrl + Shift + R` (hard refresh) on admin page
2. **Hostinger Cache**: If using cPanel, clear cache from cPanel

---

### Step 4: Verify Deployment

#### Test Backend:
Open in browser:
```
https://smpmuh35jkt.sch.id/api/articles/list.php?page=1&limit=10&status=all
```

**Expected**: JSON response with `{"success":true,"message":"","data":{...}}`  
**NOT**: 500 error

#### Test Frontend:
1. Go to: `https://smpmuh35jkt.sch.id/admin/news`
2. **Check Network tab**: Confirm `index-e23e74af.js` loads (not index-455ae079.js)
3. **Test RTL fix**: Click "New Article", type in Title field - text should type LEFT to RIGHT
4. **Test image upload**: Upload a featured image - should save to server

---

## 🔍 Troubleshooting

### If still showing 500 error:

1. **Check PHP error logs**:
   - Hostinger: `public_html/logs/error.log`
   - Or check cPanel Error Logs

2. **Verify table exists**:
   - Open phpMyAdmin
   - Select database: `u541580780_smpmuh35`
   - Check if `articles` table exists with 26 columns

3. **Test table creation manually**:
   ```sql
   SHOW TABLES LIKE 'articles';
   DESCRIBE articles;
   ```

### If text still types RTL:

1. **Verify bundle hash**: 
   - Open browser DevTools → Network tab
   - Reload page
   - Check if `index-e23e74af.js` loads (not old hash)

2. **Hard refresh**: `Ctrl + Shift + Delete` → Clear cache → Reload

---

## 📁 Quick File Checklist

Server should have these files:

```
public_html/
├── index.html (updated, references index-e23e74af.js)
├── api/
│   └── articles/
│       ├── list.php (updated)
│       └── upload_image.php (NEW)
├── assets/
│   ├── index-e23e74af.js (NEW)
│   └── index-7db43151.css
└── uploads/
    └── articles/ (folder should exist, writable)
```

---

## ✅ Success Criteria

- ✅ Articles API returns 200 OK (not 500)
- ✅ Text inputs type LEFT to RIGHT
- ✅ Featured images upload to server (not localStorage)
- ✅ Image URLs use `/uploads/articles/filename.jpg` format
- ✅ All status filters work: all, draft, pending, published, archived

---

## 🎯 Summary of Changes

| Component | Change | File |
|-----------|--------|------|
| Backend | Created image upload endpoint | `api/articles/upload_image.php` |
| Backend | Fixed status parameter handling | `api/articles/list.php` |
| Backend | Added error logging | `api/articles/list.php` |
| Frontend | Fixed RTL text (dir="ltr") | `NewsManager.jsx` |
| Frontend | New bundle hash | `index-e23e74af.js` |

**Commit**: `c0fe1a4`  
**Bundle**: `index-e23e74af.js`  
**Date**: January 8, 2026
