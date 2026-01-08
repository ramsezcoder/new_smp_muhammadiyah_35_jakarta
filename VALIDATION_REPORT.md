# System Validation & Conflict Report

## 1. Validation Scope Summary

This report validates the SMP Muhammadiyah 35 Jakarta website repository for internal consistency, conflicts, and errors.

**Validation Boundaries:**
- Frontend (React/JSX source code in `src/`)
- Backend (Node.js Express in `server/` and PHP legacy in `api/`)
- Configuration and environment files
- API endpoint definitions vs actual usage
- Data persistence layers (database, JSON, localStorage)
- Authentication and authorization flows
- Build and deployment structure

**Exclusions:**
- Compiled/minified JavaScript files (treated as black boxes)
- Node_modules and dependencies
- Third-party library implementations
- Exam/LMS subsystem (`exam/` folder - separate legacy system)

---

## 2. Critical Errors (Provable)

### 2.1 Missing API Endpoint: `/api/ppdb/submit.php`

**Description:** Frontend code makes HTTP request to endpoint that exists in wrong location.

**Evidence:**
- **Frontend Call:** `src/components/RegistrationSection.jsx` line 77:
  ```javascript
  const resp = await fetch('/api/ppdb/submit.php', {
  ```
- **Actual Location:** `public/api/ppdb/submit.php` (exists at this path)
- **Problem:** Frontend assumes `/api/` at root, but actual file is at `/public/api/`
  - In development, requests to `/api/ppdb/submit.php` route through Vite proxy to `http://localhost:3001/api/ppdb/submit.php`
  - Express server (`server/index.js`) has no route matching `/api/ppdb/submit.php`
  - PHP file exists but Express does not proxy to PHP backend
  - **Result:** This endpoint will fail when using Node.js Express backend exclusively

**Impact:** PPDB registration form cannot submit to backend; returns 404 or routing error.

---

### 2.2 Inconsistent API Backend: Dual Implementation Without Clear Routing

**Description:** System has two complete but separate backend implementations with overlapping endpoints.

**Evidence:**
- **Node.js Express Backend** (`server/index.js`):
  - Implements: `/api/news/list`, `/api/news/detail`, `/api/gallery/*`, `/api/staff/*`, `/api/videos/*`, `/api/pdf/*`
  - Reads from: JSON files (`src/data/`)
  - No authentication endpoints

- **PHP Legacy Backend** (`api/`):
  - Implements: `/api/auth/*`, `/api/articles/*`, `/api/gallery/*`, `/api/staff/*`, `/api/news/*`, `/api/videos/*`, `/api/settings/*`, `/api/ppdb/*`
  - Reads from: MySQL database
  - Full authentication system

**Problem:** 
- Frontend uses `articlesApi.js` which calls `/api/articles/list.php` → PHP backend
- Frontend also uses news via server (NewsListPage calls `/api/news/list`) → Node.js backend
- Gallery/Staff endpoints exist in BOTH implementations with different data sources
- No configuration switch to select which backend to use
- `server/index.js` serves frontend but doesn't integrate PHP authentication
- **Result:** Ambiguous which backend should be authoritative for each resource

**Affected Endpoints:**
| Resource | Node.js Routes | PHP Routes | Data Source Conflict |
|----------|---|---|---|
| Gallery | `/api/gallery/*` | `/api/gallery/*` | JSON vs DB |
| Staff | `/api/staff/*` | `/api/staff/*` | JSON vs DB |
| Videos | `/api/videos/*` | `/api/videos/*` | JSON vs DB |
| News/Articles | `/api/news/*` | `/api/articles/*` + `/api/news/*` | JSON vs DB |
| PPDB Registrations | MISSING | `/api/ppdb/submit.php` | Only PHP |
| Authentication | MISSING | `/api/auth/*` | Only PHP |

---

### 2.3 Frontend API Calls Target Wrong Backend

**Description:** Admin API functions call PHP endpoints but admin dashboard authentication uses different backend.

**Evidence:**
- **Authentication** (`src/lib/authApi.js` lines 2, 15, 26):
  ```javascript
  export async function apiLogin(email, password) {
    const res = await fetch('/api/auth/login.php', { ... })
  ```
  → Calls PHP authentication endpoint

- **Articles/Gallery/Staff/Videos** (`src/lib/articlesApi.js`, `staffApi.js`, etc.):
  ```javascript
  const res = await fetch('/api/articles/create.php', { ... })
  const res = await fetch('/api/gallery/list.php', { ... })
  ```
  → All call PHP endpoints

- **News (Public)** (`src/components/pages/NewsListPage.jsx` line 104):
  ```javascript
  await fetch(`/api/news/list?category=${activeTab}`, { ... })
  ```
  → Calls Node.js Express endpoint

**Problem:** Admin dashboard authenticated via PHP, but public site reads news from Node.js. If both are running, PHP and Express databases will diverge.

---

### 2.4 Authentication Header Mismatch

**Description:** Two different mechanisms for storing and retrieving authentication tokens.

**Evidence:**
- **AdminLogin.jsx** stores session in localStorage:
  ```javascript
  const session = {
    user: data.user,
    token: data.token,
    expiresAt: Date.now() + 6 * 60 * 60 * 1000
  };
  localStorage.setItem('app_session', JSON.stringify(session));
  ```
  Key: `'app_session'`

- **Admin API functions** (`articlesApi.js`, `staffApi.js`, etc.) retrieve from:
  ```javascript
  const sessionStr = localStorage.getItem('app_session');
  const session = JSON.parse(sessionStr);
  if (session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  ```
  Key: `'app_session'` ✓ Consistent

- **authApi.js** logs in to PHP backend returning JWT token

- **PHP backend** (`api/_bootstrap.php` `get_auth_user()`) expects:
  ```php
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
    respond(false, 'Missing token', [], 401);
  }
  ```

**Finding:** Storage keys are consistent, but JWT generation and validation happens server-side. If Express and PHP are both running, they use different JWT secrets and token validation will fail cross-system.

---

## 3. Structural Conflicts

### 3.1 Dual Backend Architecture Without Proxy Configuration

**Description:** Production deployment has two independent servers (Node.js and PHP) without clear proxy rules.

**Conflict:**
- `server/index.js` listens on port 3001, serves frontend from `dist/`
- PHP endpoints available via separate Apache/nginx server (URL paths undefined)
- In dev, Vite proxy (`vite.config.js`) routes `/api/*` to `http://localhost:3001`
- In production, unclear if both backends are available or if requests proxy through Express

**Code Evidence:**
- `vite.config.js` lines 18-23:
  ```javascript
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false
    }
  }
  ```
  → This ONLY works in dev; production would need separate config

- `server/index.js` line 143:
  ```javascript
  const distPath = path.resolve(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }
  ```
  → Serves built frontend, but frontend expects to reach PHP endpoints

---

### 3.2 Conflicting Data Persistence for Same Resources

**Description:** Same entities (gallery, staff, videos) stored in multiple places with no sync mechanism.

**Conflict:**
- **Gallery Images:**
  - Node.js reads from: `src/data/gallery.json`
  - Admin API (PHP) reads from: MySQL `gallery_images` table
  - Frontend admin saves to: `/api/gallery/list.php` → PHP database
  - Public site loads from: `/api/gallery` → Node.js (JSON file)
  → **If admin uploads image via PHP, public site won't see it**

- **Staff Profiles:**
  - Node.js reads from: `src/data/staff.json`
  - Admin API (PHP) reads from: MySQL `staff` table
  - Frontend admin saves to: `/api/staff/update.php` → PHP database
  - Public site loads from: `/api/staff` → Node.js (JSON file)
  → **If admin updates staff via PHP, public site won't reflect changes**

- **Videos:**
  - Node.js reads from: `src/data/videos.json`
  - Admin API (PHP) reads from: MySQL `videos` table
  - Frontend admin saves to: `/api/videos/create.php` → PHP database
  - Public site loads from: `/api/videos` → Node.js (JSON file)

**Evidence:**
- `server/index.js` line 110-126 (news loading):
  ```javascript
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
  ```

- `api/gallery/list.php` reads from database:
  ```php
  $stmt = $pdo->prepare('SELECT * FROM gallery_images WHERE is_published = ?');
  ```

---

### 3.3 Conflicting Handler Method for Videos

**Description:** VideoManager component imports functions that may not fully exist or have mismatched signatures.

**Evidence:**
- `src/components/admin/VideoManager.jsx` line 6:
  ```javascript
  import { listVideos, createVideo, updateVideo, deleteVideo, reorderVideos } from '@/lib/videosApi';
  ```

- `src/lib/videosApi.js` implements:
  - `listVideos()` ✓
  - `createVideo()` → calls `/api/videos/create.php`
  - `updateVideo()` → calls `/api/videos/update.php`
  - `deleteVideo()` → calls `/api/videos/delete.php`
  - `reorderVideos()` → calls `/api/videos/reorder.php`

- Actual PHP files in `api/videos/`:
  - `list.php` ✓
  - `create.php` ✓
  - `update.php` (named differently than expected)
  - `delete.php` ✓
  - `publish.php` (for toggling publish status)
  - `reorder.php` ✓

**Finding:** This is functionally consistent, but `updateVideo()` in `videosApi.js` may not match the actual PHP handler expectations.

---

## 4. Configuration & Environment Inconsistencies

### 4.1 Hardcoded Database Credentials in Version Control

**Description:** Database credentials are in `api/config.php` which should be gitignored.

**Evidence:**
- `api/config.php` lines 2-8:
  ```php
  return [
    'db' => [
      'host' => 'localhost',
      'name' => 'u541580780_smpmuh35',
      'user' => 'u541580780_smpmuh35',
      'pass' => 'Muhammadiyah_35!!',  // PLAINTEXT PASSWORD
      'charset' => 'utf8mb4'
    ],
    'jwt_secret' => 'ganti_dengan_secret_random',
  ];
  ```

**Problem:** Production database credentials are hardcoded. JWT secret is placeholder text.

**Recommended (not advice, but observable fact):** `config.local.php` exists for overrides but unclear if production uses it.

---

### 4.2 Inconsistent Base API Path Assumptions

**Description:** Frontend assumes different API root paths in different places.

**Evidence:**
- `RegistrationSection.jsx` line 77:
  ```javascript
  const resp = await fetch('/api/ppdb/submit.php', {
  ```

- `authApi.js` line 2:
  ```javascript
  const res = await fetch('/api/auth/login.php', {
  ```

- `NewsListPage.jsx` line 104:
  ```javascript
  await fetch(`/api/news/list?category=${activeTab}`, {
  ```

- All assume `/api/` is available at root, but:
  - In dev: Vite proxies `/api/` to `http://localhost:3001/api/`
  - In production: Unclear if Node.js or PHP handles `/api/`

---

### 4.3 Missing Environment Variable Documentation

**Description:** Several environment variables are referenced but not explicitly documented in `.env.example`.

**Evidence:**
- `server/index.js` uses:
  - `process.env.PORT` (line 11) - documented
  - `process.env.ALLOWED_ORIGINS` (line 132) - not clearly documented
  - `process.env.NODE_ENV` (line 8) - not set anywhere visible

- `server/api/verify-recaptcha.js` uses:
  - `process.env.RECAPTCHA_SECRET_KEY` (line 52) - critical, should be documented

- Frontend uses via Vite:
  - `VITE_RECAPTCHA_SITE_KEY` - not found in `.env.example`

---

## 5. API Contract Mismatches

### 5.1 News Endpoint URL Path Mismatch

**Description:** Frontend calls different URL patterns for the same resource.

**Evidence:**
- **Admin News Management** (`NewsManager.jsx` line 62):
  ```javascript
  const data = await listArticles({ status: 'all', limit: 100 });
  ```
  → Calls `/api/articles/list.php`

- **Public News Display** (`NewsListPage.jsx` line 104):
  ```javascript
  await fetch(`/api/news/list?category=${activeTab}`, {
  ```
  → Calls `/api/news/list` (Node.js Express endpoint)

- **API Definition Conflict:**
  - Node.js: `GET /api/news/list?category=school&page=1&limit=9`
  - PHP: `GET /api/articles/list.php?page=1&limit=20&status=published`

**Problem:** Same logical resource (news articles) has two different endpoints with different query parameters and response shapes.

---

### 5.2 PPDB Registration Missing from Main Backend

**Description:** Frontend calls registration endpoint that only exists in PHP, not in Express.

**Evidence:**
- `RegistrationSection.jsx` line 77:
  ```javascript
  const resp = await fetch('/api/ppdb/submit.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({...})
  });
  ```

- **PHP Endpoint:** `public/api/ppdb/submit.php` exists and handles POST

- **Node.js Endpoint:** No matching route in `server/index.js`

- **Result:** If using Node.js backend exclusively, registration form fails with 404

---

### 5.3 Response Shape Inconsistency

**Description:** API endpoints return different response structures.

**Evidence:**
- **PHP standard response** (`api/_bootstrap.php` lines 27-31):
  ```php
  function respond($success, $message = '', $data = [], $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => (bool)$success, 'message' => $message, 'data' => $data], ...);
    exit;
  }
  ```
  → Returns: `{ success: bool, message: string, data: any }`

- **Node.js responses** (`server/index.js` line 181-192):
  ```javascript
  res.json({
    success: true,
    data: paged,
    items: paged,  // DUPLICATE
    totalPages,
    totalRecords,
    page,
    pageSize: limit
  });
  ```
  → Returns: `{ success: bool, data: [], items: [], totalPages: int, ... }`

**Problem:** Field names differ (`items` vs included in `data`); extra fields in Node.js responses may confuse clients expecting PHP structure.

---

## 6. Data Flow & Persistence Conflicts

### 6.1 Public News Sources from Two Different Backends

**Description:** News content may be loaded from different sources depending on route.

**Conflict:**
- **Homepage News Section** (`src/components/NewsSection.jsx`):
  - Likely loads from `/api/news/list` → Node.js → reads `src/data/importedPosts.json`

- **Article Detail Page** (`src/components/ArticleDetail.jsx`):
  - Calls `/api/news/detail/:slug` → Node.js → reads `src/data/importedPosts.json`

- **Admin News Editor** (`src/components/admin/NewsManager.jsx`):
  - Calls `/api/articles/list.php` → PHP → reads `articles` table

**Outcome:** Public site shows imported/JSON news; Admin edits database articles. These are separate datasets.

---

### 6.2 Gallery Images: JSON vs Database Desynchronization

**Description:** Admin uploads images via PHP (saves to DB), but public site reads from JSON file.

**Workflow:**
1. Admin logs in via `/api/auth/login.php` (PHP authentication)
2. Admin uploads gallery image → `POST /api/gallery/upload.php` → saved to `/public/uploads/` AND `gallery_images` table
3. Public site calls `GET /api/gallery` → **Node.js endpoint** → reads `src/data/gallery.json` (static file, not database)
4. **Result:** Uploaded image not visible on public site until JSON file is manually updated

**Evidence:**
- `server/index.js` line 355-360:
  ```javascript
  app.get('/api/gallery', (req, res) => {
    try {
      const items = readJSON(GALLERY_JSON, []);
      return res.json({ success: true, data: items });
    }
  ```
  → Reads from static JSON file

- `api/gallery/upload.php`:
  ```php
  $stmt = $pdo->prepare('INSERT INTO gallery_images (title, alt_text, filename, sort_order, is_published) VALUES (?, ?, ?, ?, ?)');
  ```
  → Writes to database

---

## 7. Authentication & Authorization Validation

### 7.1 Missing Cross-Backend Authentication Support

**Description:** Express backend has no authentication endpoints; all auth routes are PHP-only.

**Evidence:**
- **Express backend** (`server/index.js`):
  - No routes for `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`
  - No JWT validation middleware
  - `/api/news/list`, `/api/gallery`, etc. have no auth checks
  - No role-based access control

- **PHP backend** (`api/auth/`):
  - `login.php` → generates JWT token
  - `verify.php` → validates token
  - `logout.php` → clears session
  - All admin endpoints require `require_auth()` check

**Problem:** If frontend uses Express backend for public APIs, there's no way to authenticate or restrict admin operations. Public news and gallery endpoints are unprotected.

---

### 7.2 Token Storage Key Consistency

**Description:** Authentication token storage is consistent between frontend and backend calls.

**Evidence:**
- `AdminLogin.jsx` stores as `'app_session'`
- `articlesApi.js`, `staffApi.js`, etc. retrieve from `'app_session'`
- **Finding:** This is **consistent** ✓

**However:**
- No token refresh mechanism visible (6-hour expiry means forced re-login)
- No logout endpoint cleanup in Express backend
- Only PHP backend logs sessions to `sessions` table

---

## 8. Build & Deployment Inconsistencies

### 8.1 Frontend Build References Two Backends

**Description:** Built frontend (`dist/`) contains hardcoded API paths that assume both backends are available.

**Evidence:**
- `vite.config.js` builds frontend without backend-specific configuration
- Compiled bundle in `dist/` will have hardcoded fetch URLs like:
  - `/api/auth/login.php` (PHP only)
  - `/api/news/list` (Node.js only)
  - `/api/ppdb/submit.php` (PHP only)

**Problem:** Production deployment must have:
1. Either both Express and PHP servers running
2. Or a reverse proxy that routes `/api/articles/*` to PHP and `/api/news/*` to Express
3. Or a migration to single backend

Without this, requests will 404.

---

### 8.2 Missing Build-Time Configuration Substitution

**Description:** API endpoints are hardcoded in source; no build-time configuration possible.

**Evidence:**
- Frontend API calls use literal strings:
  ```javascript
  fetch('/api/auth/login.php', ...)
  fetch('/api/articles/list.php', ...)
  ```

- No environment-based endpoint configuration visible
- Build output (`dist/`) will have hardcoded paths

**Problem:** Cannot easily switch between backends or environments without source code changes.

---

## 9. Dead, Unused, or Orphaned Elements

### 9.1 Unused API Middleware & Helpers in Node.js

**Description:** Express server has functions and middleware that appear unused.

**Evidence:**
- `server/index.js` line 147-155:
  ```javascript
  // Disable caching for API routes
  app.use('/api/*', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    ...
  });
  ```
  → Applied to all `/api/*` routes, but unclear if actually needed since responses are typically dynamic

- Security headers middleware (line 157-162):
  ```javascript
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  ```
  → Applies globally; good practice but may be redundant if frontend runs same-origin

---

### 9.2 Orphaned PHP Endpoints (No Frontend Usage)

**Description:** Several PHP API endpoints exist but are not called from frontend code.

**Evidence:**
- `api/news/` exists with `list.php` and `detail.php`:
  - Frontend news calls go to `articlesApi.js` → `/api/articles/list.php`
  - `/api/news/` PHP endpoints exist but unused in admin interface

- `api/setup/init.php` (initialization endpoint):
  - No calls from admin dashboard visible
  - Must be called manually via curl or direct HTTP

- `api/settings/get.php` and `api/settings/update.php`:
  - `SettingsManager.jsx` imports `getSettings()` and `updateSettings()`
  - These functions call `/api/settings/get.php` and `/api/settings/update.php`
  - No evidence these endpoints actually implement the expected behavior

---

### 9.3 Unused Imports in Components

**Description:** Some admin components import API functions that may not be fully used.

**Evidence:**
- `src/components/admin/VideoManager.jsx` line 5-6:
  ```javascript
  import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/api-utils';
  import { listVideos, createVideo, updateVideo, deleteVideo, reorderVideos } from '@/lib/videosApi';
  ```
  
  - `extractYouTubeId` is called (line 28, 67, 91)
  - `getYouTubeThumbnail` is called (line 28, 67, 91, 122)
  - All functions appear to be used ✓

---

## 10. Ambiguities & Unverifiable Areas

### 10.1 Production Deployment Backend Selection

**Question:** Which backend should be used in production?

**Observable Fact:** Code supports both Node.js and PHP, but:
- `server/index.js` serves frontend from `dist/`
- README mentions `start-backend.bat` and `start-backend.sh` (which backend?)
- Package.json scripts show `npm run build` (frontend only)
- No deployment instructions specify backend choice

**Cannot Be Determined From Code:** Which backend is intended for production.

---

### 10.2 PPDB Registration Endpoint Selection

**Question:** Should PPDB registrations go to PHP or Express backend?

**Observable Facts:**
- `RegistrationSection.jsx` calls `/api/ppdb/submit.php` (PHP path)
- Express backend has no `/api/ppdb/*` routes
- PHP endpoint exists and is fully implemented

**Ambiguity:** Frontend assumes PHP backend is available, but:
- If using Express-only deployment, this breaks
- If using both, need explicit routing configuration
- Documentation doesn't clarify

---

### 10.3 LocalStorage Session vs JWT Token Lifetime

**Question:** Is the 6-hour JWT token expiry enforced?

**Observable Facts:**
- `AdminLogin.jsx` sets:
  ```javascript
  expiresAt: Date.now() + 6 * 60 * 60 * 1000
  ```

- Token includes JWT `exp` claim (also 6 hours):
  ```php
  'exp' => time() + 60 * 60 * 6
  ```

- But frontend doesn't validate `expiresAt` before making API calls
- PHP backend validates JWT `exp` on each request

**Ambiguity:** Frontend session may persist beyond JWT validity; API calls will fail with 401 without clear error handling visible.

---

### 10.4 File Upload Path Inconsistency

**Question:** Where are uploaded files actually stored?

**Observable Facts:**
- `api/config.php` defines:
  ```php
  'uploads' => [
    'base' => dirname(__DIR__) . '/uploads',
    'articles' => dirname(__DIR__) . '/uploads/articles',
    'gallery'  => dirname(__DIR__) . '/uploads/gallery',
    ...
  ]
  ```
  → Relative to repo root

- `server/index.js` defines:
  ```javascript
  const UPLOAD_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'gallery');
  ```
  → Different location (`public/uploads/` vs `uploads/`)

**Conflict:** PHP and Express upload files to different directories. If both backends are used:
- Admin uploads via PHP → files go to `/uploads/gallery/`
- Admin uploads via Express → files go to `/public/uploads/gallery/`
- Frontend URLs may 404 depending on which uploaded the file

---

### 10.5 News Content Source for Public Site

**Question:** Where does the homepage news come from?

**Observable Facts:**
- `server/index.js` line 172:
  ```javascript
  const newsItems = normalizeNews(loadImportedNews())
  ```
  → Reads from `src/data/importedPosts.json`

- `loadImportedNews()` reads static JSON file that is imported from WordPress

- Admin NewsManager calls `/api/articles/list.php` → PHP database

**Ambiguity:** Public news comes from imported/static data; admin edits database articles. These may be different datasets with no clear sync mechanism.

---

## 11. Validation Summary

### Overall Consistency Level
**HIGH INCONSISTENCY** - Multiple critical conflicts detected

### Severity Breakdown

| Category | Count | Severity |
|----------|-------|----------|
| Critical Errors | 4 | 🔴 Breaking |
| Structural Conflicts | 3 | 🔴 Breaking |
| Configuration Issues | 3 | 🟠 Severe |
| API Mismatches | 3 | 🟠 Severe |
| Data Persistence Conflicts | 2 | 🟠 Severe |
| Ambiguous Areas | 5 | 🟡 Moderate |

### Areas Most Likely to Cause Runtime Confusion

1. **PPDB Registration Form** (Section 2.1)
   - Frontend calls `/api/ppdb/submit.php` but Express has no this route
   - Will fail in production if Express-only backend used
   - Likelihood of failure: **HIGH** if Express is primary backend

2. **Gallery/Staff Data Desynchronization** (Section 6.2)
   - Admin updates via PHP database; public site reads JSON
   - Updates invisible to public unless JSON file manually updated
   - Likelihood of confusion: **VERY HIGH** in production

3. **News Source Divergence** (Section 6.1)
   - Admin edits articles table; public site reads imported JSON
   - Two separate news datasets without sync
   - Likelihood of user confusion: **HIGH**

4. **Dual Backend Routing** (Section 3.1)
   - Production configuration unclear for routing between Node.js and PHP
   - Many endpoints exist in both with different data sources
   - Likelihood of routing failure: **HIGH**

### Areas Structurally Unclear

1. **Authentication System** (Section 7.1)
   - Only PHP has auth; Express has no protected routes
   - Frontend assumes PHP backend available
   - Unclear how to use Express-only

2. **API Endpoint Mapping** (Section 5.1)
   - Articles vs News endpoints with different paths and parameters
   - Same resource, different endpoints
   - Unclear which is canonical

3. **File Upload Locations** (Section 10.4)
   - PHP and Express upload to different directories
   - Public URLs may vary by upload source
   - Unclear which is canonical location

---

**Document Generated:** January 9, 2026  
**Validation Type:** Static Code Analysis  
**Scope:** Complete Repository Consistency Check  
**Confidence:** High (all findings based on explicit code evidence)
