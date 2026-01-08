# Website System Documentation

## 1. Website Overview

**Name:** SMP Muhammadiyah 35 Jakarta - Islamic & Global School  
**Type:** Educational Institution Website with Admin CMS  
**Primary Purpose:** School information portal, student registration (PPDB - Pendaftaran Peserta Didik Baru), news management, and administrative backend  
**Intended Users:** 
- Public: Students, parents, prospective families seeking school information and registration
- Administrative: School staff with various roles (Superadmin, Admin, Author/Post Maker)

**Key Designation:** Modern, security-focused school website built with React frontend and PHP/Node.js backend, featuring a comprehensive admin dashboard for content management (news, articles, gallery, staff profiles, videos).

**Accreditation:** Grade A  
**Location:** Jl. Panjang No.19, RT.8/RW.9, Cipulir, Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12230  
**NPSN (National ID):** 20106980  
**Contact:** (021) 7210785 | smpmuh35@gmail.com

---

## 2. Directory Structure

### Root Level Directories

| Directory | Purpose |
|-----------|---------|
| `src/` | Frontend React source code (JSX, CSS, utilities, components) |
| `server/` | Node.js Express backend server for API routes, file uploads, and data management |
| `api/` | Legacy PHP backend API endpoints (alternative to Node.js server) |
| `public/` | Static assets publicly served to clients (compiled builds, uploads, PDFs, manifests) |
| `dist/` | Production build output from Vite (generated after `npm run build`) |
| `uploads/` | File upload storage for articles, gallery images, staff photos, and videos |
| `exam/` | Legacy exam/LMS system (CodeIgniter framework - separate from main application) |
| `data/` | JSON data files for galleries, staff, videos, and imported news |
| `scripts/` | Build and utility scripts (WordPress import, icon generation) |
| `pdfs/` | PDF file storage for downloadable materials |
| `wordpress_import/` | WordPress export data for content migration |

### Source Code Structure (`src/`)

```
src/
├── main.jsx                 # React entry point, initializes BrowserRouter
├── App.jsx                  # Main routing configuration & page layouts
├── index.css                # Global styles (Tailwind CSS directives)
├── assets/                  # Images, icons, static media files
├── components/
│   ├── admin/              # Admin dashboard sub-components (NewsManager, GalleryManager, etc.)
│   ├── pages/              # Feature pages (StaffPage, GalleryIndexPage, VideoGallery, etc.)
│   ├── ui/                 # Reusable UI components (buttons, dialogs, sliders, etc. - Radix UI based)
│   ├── Navigation.jsx      # Top navigation bar with menu
│   ├── Footer.jsx          # Footer component
│   ├── AdminDashboard.jsx  # Main admin dashboard shell
│   ├── ArticleDetail.jsx   # Single article/news view
│   ├── HeroSection.jsx     # Landing page hero banner
│   ├── WelcomeSection.jsx  # Welcome content block
│   ├── NewsSection.jsx     # Homepage news carousel
│   ├── GallerySection.jsx  # Homepage gallery preview
│   └── [Other sections]    # Various homepage content sections
├── config/
│   └── staticMode.js       # Configuration for static rendering modes
├── data/
│   ├── gallery.json        # Gallery image metadata & ordering
│   ├── staff.json          # Staff profile data
│   ├── videos.json         # YouTube video metadata
│   ├── news.school.json    # School news articles
│   ├── news.student.json   # Student news articles
│   ├── pdf.json            # PDF document metadata
│   └── importedPosts.json  # Imported content from WordPress
├── lib/
│   ├── seo-utils.js        # SEO metadata generation, schema.org structured data
│   ├── articlesApi.js      # Article/news API wrapper functions
│   ├── authApi.js          # Authentication API (login, logout, verify)
│   ├── galleryApi.js       # Gallery upload/management API calls
│   ├── staffApi.js         # Staff management API calls
│   ├── videosApi.js        # Video management API calls
│   ├── recaptcha.js        # Google reCAPTCHA v3 client-side integration
│   ├── db.js               # LocalStorage database abstraction (session persistence)
│   ├── blobStore.js        # Base64 blob storage for images
│   ├── safeStorage.js      # Safe localStorage wrapper with encryption
│   ├── staticStorage.js    # Static/fallback storage mechanism
│   └── [Other utilities]   # API utilities, settings, email, etc.
└── utils/
    ├── sanitize.js         # Input sanitization functions (XSS prevention)
    └── query.js            # Query builder utilities
```

### Backend Structure (`server/` - Node.js Express)

```
server/
├── index.js                 # Main Express app with all API route definitions
├── package.json             # Dependencies: express, cors, multer, sharp, dotenv
├── .env                     # Environment variables (not in repo, created locally)
├── .env.example             # Example environment file template
├── api/
│   └── verify-recaptcha.js  # reCAPTCHA token verification endpoint
├── data/
│   └── pdf-views.json       # PDF view tracking data
└── temp/                    # Temporary upload directory for multer
```

### Backend Structure (`api/` - PHP Legacy)

```
api/
├── _bootstrap.php           # Configuration loading, database connection, helper functions
├── config.php               # Default database configuration
├── config.local.php         # Local overrides (production credentials)
├── schema.sql               # Database schema definitions for all tables
├── db_migrate.php           # Migration script to create tables
├── db_seed_users.php        # Script to create default admin users
├── reset_admin_password.php # Admin password reset utility
├── verify-recaptcha.js      # Standalone reCAPTCHA verification
├── auth/
│   ├── login.php            # Login endpoint (email/password → JWT token)
│   ├── verify.php           # Token verification endpoint
│   └── logout.php           # Logout endpoint
├── articles/
│   ├── list.php             # Get published articles with pagination
│   ├── create.php           # Create new article (admin only)
│   ├── update.php           # Update article (admin only)
│   └── delete.php           # Delete article (admin only)
├── gallery/
│   ├── list.php             # Get gallery images
│   ├── upload.php           # Upload gallery image
│   ├── update_meta.php      # Update image metadata
│   ├── delete.php           # Delete image
│   ├── reorder.php          # Reorder gallery images
│   └── publish.php          # Toggle image publication status
├── staff/
│   ├── list.php             # Get staff members
│   ├── create.php           # Add staff member
│   ├── update.php           # Update staff profile
│   ├── delete.php           # Delete staff
│   ├── reorder.php          # Reorder staff display
│   └── publish.php          # Toggle staff visibility
├── news/
│   └── [Similar structure to articles]
├── videos/
│   └── [Similar structure to articles]
├── settings/
│   └── [Site settings management]
└── setup/
    └── init.php             # One-command database + user initialization
```

---

## 3. Key File Documentation

### Frontend Core Files

| File | Purpose |
|------|---------|
| [index.html](index.html) | HTML entry point; loads React root container and Vite module |
| [src/main.jsx](src/main.jsx) | React application entry; initializes BrowserRouter and mounts App component |
| [src/App.jsx](src/App.jsx) | Main routing configuration; defines page layouts, homepage sections, article routes, admin dashboard |
| [src/index.css](src/index.css) | Global CSS with Tailwind directives (@tailwind, @layer, @apply) |

### Frontend Configuration

| File | Purpose |
|------|---------|
| [package.json](package.json) | Project dependencies (React, Vite, Tailwind, Radix UI, Framer Motion, React Router, React Helmet) and build scripts |
| [vite.config.js](vite.config.js) | Vite bundler configuration; defines build output directory, dev server proxying to backend, asset includes |
| [tailwind.config.js](tailwind.config.js) | Tailwind CSS theme configuration; color palette, animations, responsive breakpoints |
| [postcss.config.js](postcss.config.js) | PostCSS configuration; enables Tailwind and Autoprefixer for CSS compilation |

### Backend Configuration

| File | Purpose |
|------|---------|
| [server/package.json](server/package.json) | Backend dependencies (Express, CORS, Multer, Sharp for image processing) |
| [api/config.php](api/config.php) | Database connection credentials and JWT secret configuration |
| [api/schema.sql](api/schema.sql) | SQL schema definition for users, sessions, articles, gallery, staff, videos tables |
| [api/_bootstrap.php](api/_bootstrap.php) | Database connection initialization, security headers, CORS, authentication helpers, file upload validation |

### SEO & Metadata

| File | Purpose |
|------|---------|
| [src/lib/seo-utils.js](src/lib/seo-utils.js) | Site information, keywords, functions to generate title/description, schema.org structured data (Organization, LocalBusiness, Breadcrumb), Open Graph tags |
| [manifest.json](manifest.json) | PWA (Progressive Web App) manifest; app name, icons, display mode, theme colors |
| [robots.txt](robots.txt) | Search engine crawling rules |
| [sitemap.xml](sitemap.xml) | XML sitemap for search engines |

### Data Files

| File | Purpose |
|------|---------|
| [src/data/gallery.json](src/data/gallery.json) | Gallery images metadata (title, filename, sort_order, publication status) |
| [src/data/staff.json](src/data/staff.json) | Staff member profiles (name, role, photo, bio, sort order) |
| [src/data/videos.json](src/data/videos.json) | YouTube video metadata (title, youtube_id, thumbnail, description, sort order) |
| [src/data/news.school.json](src/data/news.school.json) | School news articles with full content, SEO metadata, author info |
| [src/data/news.student.json](src/data/news.student.json) | Student news articles, same structure as school news |
| [src/data/importedPosts.json](src/data/importedPosts.json) | Content imported from WordPress export (migrated articles) |
| [server/data/pdf-views.json](server/data/pdf-views.json) | PDF viewing statistics tracked server-side |

### Utility Files

| File | Purpose |
|------|---------|
| [src/utils/sanitize.js](src/utils/sanitize.js) | Input sanitization functions to prevent XSS attacks (removes HTML tags, dangerous characters) |
| [src/utils/query.js](src/utils/query.js) | Query builder or database query utilities |
| [src/lib/authApi.js](src/lib/authApi.js) | Frontend wrapper for authentication API calls (login, logout, verify token) |
| [src/lib/db.js](src/lib/db.js) | LocalStorage abstraction for session persistence and user data caching |
| [src/lib/recaptcha.js](src/lib/recaptcha.js) | Google reCAPTCHA v3 client-side initialization and token handling |

---

## 4. Backend System

### Programming Languages & Frameworks

**Node.js Backend (Primary):**
- **Framework:** Express.js (HTTP server and routing)
- **Runtime:** Node.js >=16.0.0
- **Key Libraries:**
  - `cors` - Cross-Origin Resource Sharing middleware
  - `multer` - File upload middleware
  - `sharp` - Image processing and compression
  - `dotenv` - Environment variable management
  - `express.json()` - Request body parsing

**PHP Backend (Legacy/Alternative):**
- **Framework:** Pure PHP 7.4+ with PDO for database access
- **Database:** MySQL 5.7+ / MariaDB with utf8mb4 charset
- **Authentication:** JWT (JSON Web Tokens) with HS256 hashing
- **Password Hashing:** PHP `password_hash()` with PASSWORD_DEFAULT (bcrypt)

### Backend Execution Flow

1. **Server Start:**
   - Express server initializes on port 3001 (configurable via `PORT` environment variable)
   - CORS middleware configured to allow requests from specified origins
   - Static file serving: built frontend (dist/) and public assets
   - Security headers applied (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

2. **API Request Handling:**
   - Request reaches `/api/*` routes with cache-control headers (no-store)
   - Middleware chain: CORS → body parsing → authentication check (for protected routes)
   - Routes delegate to business logic (file uploads, database queries, JWT generation)
   - Response sent as JSON with success/error status

3. **File Upload Process:**
   - Client POST to `/api/upload/gallery` or `/api/upload/staff`
   - Multer validates MIME type (jpeg, png, webp) and file size (max 4MB)
   - Sharp library compresses and optimizes image
   - File written to `/public/uploads/[category]/` directory
   - Base64 or filename returned to client for storage in JSON metadata

4. **Database Operations:**
   - PDO connection established using credentials from config
   - Prepared statements prevent SQL injection
   - JSON persistence: gallery/staff/videos stored as `.json` files rather than database
   - News articles read from JSON data files (importedPosts.json)

### Available API Endpoints

**News Management:**
- `GET /api/news/list?category=school&page=1&limit=9` - List news articles with pagination
- `GET /api/news/detail/:slug` - Retrieve single article by slug

**reCAPTCHA:**
- `POST /api/verify-recaptcha` - Verify Google reCAPTCHA v3 token (prevents spam on registration form)

**Gallery Management:**
- `POST /api/upload/gallery` - Upload gallery image (multipart/form-data)
- `GET /api/gallery` - Get all gallery images (read from gallery.json)
- `PATCH /api/gallery/:id` - Update image metadata (title, alt text)
- `DELETE /api/gallery/:id` - Delete image
- `POST /api/gallery/reorder` - Reorder gallery images by sort_order
- `POST /api/gallery/import-default` - Load default gallery images

**Staff Management:**
- `POST /api/upload/staff` - Upload staff photo
- `GET /api/staff` - Get all staff members
- `PATCH /api/staff/:id` - Update staff profile (name, role, photo)
- `DELETE /api/staff/:id` - Delete staff member
- `POST /api/staff/reorder` - Reorder staff display
- `POST /api/staff/import-default` - Load default staff profiles

**Video Management:**
- `GET /api/videos` - Get all videos (from videos.json)
- `POST /api/videos/add` - Add YouTube video by ID
- `DELETE /api/videos/:id` - Remove video
- `POST /api/videos/reorder` - Reorder videos
- `POST /api/videos/import-default` - Load default videos

**PDF Tracking:**
- `GET /api/pdf/views` - Get PDF view statistics
- `POST /api/pdf/view/:id` - Increment PDF view count
- `PATCH /api/pdf/view/:id` - Update PDF view metadata

**Featured Image Upload:**
- `POST /api/upload/featured` - Upload article featured image

**Health Check:**
- `GET /health` - Server health status

### Authentication Mechanisms

**Frontend (React):**
- Login form collects email and password
- Sent via `POST /api/auth/login` → receives JWT token
- Token stored in localStorage (`authToken` key)
- Subsequent API calls include token in `Authorization: Bearer <token>` header
- Token auto-validated before admin operations

**Backend (PHP/Node):**
- JWT structure: `header.payload.signature`
  - Header: `{"alg": "HS256", "typ": "JWT"}` (base64url encoded)
  - Payload: User ID, name, email, role, issue time, expiration (6 hours)
  - Signature: HMAC-SHA256 of header+payload using server secret
- Token verified via `get_auth_user()` helper in _bootstrap.php
- Signature validation prevents token tampering
- Expiration check prevents expired token usage
- Role-based access control restricts operations by user role (Superadmin, Admin, Author)

**User Roles:**
- `Superadmin` - Full system access (all CRUD operations, user management)
- `Admin` - Content management (articles, gallery, staff, videos)
- `Author` / `Post Maker` - Limited to creating/editing own articles

**Default Credentials (Set during setup):**
- Admin: `admin@smpmuh35.sch.id` / `Admin123!`
- Staff: `adminstaff@smpmuh35.sch.id` / `AdminStaff123!`
- Author: `postmaker@smpmuh35.sch.id` / `PostMaker123!`

### Session & Data Handling

**Session Tracking (Database):**
- `sessions` table logs each login: user_id, JWT token, User-Agent, IP address, expiration time
- Optional feature for audit trails and security monitoring
- Sessions auto-expire after 6 hours (matching token TTL)

**Data Persistence:**
- **Database-backed:** users, sessions, articles (if using PHP API exclusively)
- **JSON file-backed:** gallery.json, staff.json, videos.json, news files
- **LocalStorage (Client):** User authentication token, temporary form data
- **Server filesystem:** Uploaded images in /uploads/ directories

**Data Synchronization:**
- Gallery/Staff changes saved to JSON files immediately
- No real-time sync between multiple admin instances (last-write-wins)
- News articles read from importedPosts.json on each API call (cache-controlled)

---

## 5. Frontend System

### Frameworks & Libraries

**Core Framework:**
- **React 18.3.1** - UI component library with hooks
- **React Router v6.30.2** - Client-side routing (SPA navigation)
- **React Helmet v6.1.0** - Dynamic HTML head management (SEO meta tags)

**UI Component Libraries:**
- **Radix UI** - Unstyled accessible component primitives
  - Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Label, Slider, Tabs, Toast
- **Lucide React v0.469** - Icon library (Menu, LogOut, Settings, Image, Video, etc.)

**Styling:**
- **Tailwind CSS v3.4.17** - Utility-first CSS framework
- **Tailwind Merge v2.6** - Utility class conflict resolution
- **Tailwind Animate v1.0.7** - CSS animation utilities

**Motion & Animation:**
- **Framer Motion v11.15** - React animation library for smooth transitions

**Rich Text Editing:**
- **Quill v2.0.3** - WYSIWYG rich text editor
- **React Quill v2.0** - React wrapper for Quill
- **Quill Video Resize Module v1.0.2** - Video embedding and resizing in editor

**Additional Utilities:**
- **class-variance-authority v0.7.1** - Type-safe component variants
- **clsx v2.1.1** - Conditional className utility
- **fast-xml-parser v4.5.3** - XML parsing for WordPress import

### Frontend Execution Flow

1. **Page Load:**
   - Browser loads [index.html](index.html) which references `/src/main.jsx`
   - Vite development server (during `npm run dev`) or production bundle (from dist/) loads
   - React hydrates the DOM, initializing BrowserRouter with v7 features

2. **Routing:**
   - App.jsx defines all routes with React Router:
     - `/` - Homepage with multiple sections (Hero, Welcome, Pricing, News, Gallery, Registration)
     - `/news` - News list page
     - `/news/:slug` - Individual news article detail
     - `/gallery/photos` - Photo gallery grid
     - `/gallery/videos` - Video gallery
     - `/staff` - Staff directory
     - `/about/vision-mission` - School vision/mission
     - `/about/history` - School history
     - `/admin` - Admin dashboard (protected route)
   - Route changes update URL without full page reload (SPA behavior)

3. **Component Rendering:**
   - Components use React hooks (useState, useEffect, useContext) for state management
   - Framer Motion animates section visibility and transitions
   - Lazy loading for images (IntersectionObserver in background)
   - Responsive design via Tailwind breakpoints (sm, md, lg, xl, 2xl)

4. **API Communication:**
   - Components call functions from `src/lib/` (articlesApi.js, galleryApi.js, etc.)
   - Fetch API sends HTTP requests to `http://localhost:3001/api/` (dev) or production API domain
   - Responses parsed as JSON and state updated
   - Error handling with toast notifications (via `useToast()` hook)

5. **Data Flow:**
   - Read: API GET requests → state update → re-render
   - Write: Form submission → API POST/PATCH/DELETE → state update → UI confirmation (toast)
   - Local caching via localStorage for session tokens and temporary data

### Frontend ↔ Backend Communication

**Development Environment:**
- Frontend dev server runs on `http://localhost:3000` (Vite with HMR)
- Backend server runs on `http://localhost:3001` (Express)
- Vite proxy config redirects `/api/*` requests to backend

**Production Environment:**
- Single domain serves both frontend (React bundle from dist/) and backend (Express)
- API requests to same domain, same port (no cross-origin issues)

**API Request Pattern:**
```javascript
// Example: Getting news articles
fetch('http://localhost:3001/api/news/list?category=school&page=1')
  .then(res => res.json())
  .then(data => {
    // data.success, data.data, data.items
  })
```

**Authentication in Requests:**
```javascript
// Admin operations include JWT token
fetch('http://localhost:3001/api/gallery', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({...})
})
```

---

## 6. Build & Assets

### Build Process

**Development Build:**
- Command: `npm run dev`
- Vite starts dev server on port 3000 with Hot Module Replacement (HMR)
- JSX/ES modules transpiled on-the-fly
- Tailwind CSS compiled in-memory
- Backend must run separately: `cd server && npm start`

**Production Build:**
- Command: `npm run build`
- Vite bundles React, components, and styles into optimized chunks
- Output: `/dist/` directory with:
  - `index.html` - Bundled entry point
  - `index-[hash].js` - Compiled JavaScript (main application)
  - `[name]-[hash].js` - Code-split chunks (vendor, pages)
  - `.css` files - Compiled Tailwind CSS (scoped to bundles)
- Bundle is minified and code-split for optimal loading

**Build Settings (vite.config.js):**
- Output directory: `dist/`
- Sourcemap disabled for production (`sourcemap: false`)
- CSS and JS automatically minified via Vite defaults
- Asset includes: JSON, JPG, PNG, WebP files

### Compiled/Build Files

**Vite Build Output:**

| File | Purpose |
|------|---------|
| `dist/index.html` | Bundled HTML entry point with script/link tags |
| `dist/index-[hash].js` | Main React application bundle (compiled JSX, components, libraries) |
| `dist/[chunk]-[hash].js` | Code-split chunks for lazy-loaded routes and large libraries |
| `dist/[style]-[hash].css` | Compiled Tailwind CSS with all applied utility classes |
| `dist/assets/` | Static assets (images, fonts, icons) |

**Hash Naming:**
- Files use content-based hashing: `index-a1b2c3d4.js`
- Hash changes only when file content changes (cache busting)
- Enables aggressive long-term caching in production

**Black Box Approach:**
- Compiled JavaScript files are obfuscated and minified
- Direct analysis not feasible without source maps
- Functionality documented via source code in `src/` directory

### Differences Between Source and Build

| Aspect | Source (`src/`) | Build (`dist/`) |
|--------|---|---|
| Format | JSX, ES Modules, SCSS | Plain JavaScript, bundled CSS |
| Size | ~300KB (uncompressed) | ~150KB (minified, gzipped ~40KB) |
| Execution | Interpreted by Vite dev server | Direct browser execution |
| Debugging | Source maps available in dev | Sourcemaps disabled for security |
| Imports | Relative imports (tree-shakable) | All imports resolved and bundled |
| CSS | Tailwind directives (@tailwind) | Compiled utility classes |

### Assets & Static Files

**Frontend Assets:**
- Located in `src/assets/` and included in build
- Images: PNG, JPG, WebP formats
- Icons: Lucide React (SVG) or imported images

**Public Static Files:**
- Directory `public/` copied to root of built site
- Contains: favicon.ico, manifest.json, robots.txt, sitemap.xml
- Served directly without modification

**Upload Directories:**
- `public/uploads/` - Runtime directory for uploaded files (created during server init)
  - `articles/` - Featured images for articles
  - `gallery/` - Gallery images
  - `staff/` - Staff member photos
  - `videos/` - Video thumbnails (if stored locally)

**Role of Build Directories:**
- `/dist/` - Production-ready frontend, served on site root
- `/public/` - Static assets and build output, served as-is
- Production deployment: Copy `dist/*` to web server root, ensure `/api/` routes proxy to backend

---

## 7. Data & Storage

### Database Structure

**MySQL Database Name:** `u541580780_smpmuh35` (production) or local variant  
**Charset:** utf8mb4 (supports emoji and special characters)

**Tables:**

#### `users` Table
```
id (INT, PK, AUTO_INCREMENT)
name (VARCHAR)
email (VARCHAR, UNIQUE) - Login identifier
password_hash (VARCHAR) - bcrypt hashed password
role (ENUM: 'Superadmin', 'Admin', 'Author') - Access level
status (ENUM: 'active', 'disabled') - Account status
last_login (DATETIME) - Timestamp of last successful login
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### `sessions` Table (Optional Audit)
```
id (INT, PK, AUTO_INCREMENT)
user_id (INT, FK → users.id)
session_token (VARCHAR) - JWT token issued at login
user_agent (VARCHAR) - Browser/client info
ip_address (VARCHAR) - Login IP address
expires_at (DATETIME) - Token expiration
created_at (TIMESTAMP)
```

#### `articles` Table
```
id (INT, PK)
title (VARCHAR)
slug (VARCHAR, UNIQUE) - URL-friendly identifier
content_html (MEDIUMTEXT) - Rich HTML content from Quill editor
excerpt (TEXT) - Short summary
featured_image (VARCHAR) - Filename of cover image
featured_image_alt (VARCHAR) - Alt text for accessibility
category (VARCHAR) - Article category
tags_json (VARCHAR) - JSON array of tags/hashtags
status (ENUM: 'draft', 'pending', 'published', 'archived')
seo_title (VARCHAR) - SEO page title
seo_description (VARCHAR) - Meta description
og_image (VARCHAR) - Open Graph image
author_id (INT) - User who created article
author_name (VARCHAR) - Author display name
sort_order (INT) - Display priority
published_at (DATETIME) - Publication date
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
Indexes: slug (UNIQUE), status, published_at, sort_order, category
```

#### `gallery_images` Table
```
id (INT, PK)
title (VARCHAR) - Image title/caption
alt_text (VARCHAR) - Accessibility text
filename (VARCHAR) - Stored filename
sort_order (INT) - Gallery display order
is_published (TINYINT) - Visibility flag
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
Indexes: sort_order, is_published
```

#### `staff` Table
```
id (INT, PK)
name (VARCHAR) - Staff member name
role (VARCHAR) - Position/job title
photo_filename (VARCHAR) - Portrait filename
bio (TEXT) - Biography/description
sort_order (INT) - Display order on staff page
is_published (TINYINT) - Visibility flag
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
Indexes: sort_order, is_published
```

#### `videos` Table
```
id (INT, PK)
title (VARCHAR) - Video title
youtube_id (VARCHAR, UNIQUE) - YouTube video ID
thumbnail_url (VARCHAR) - Cached thumbnail URL
description (TEXT) - Video description
sort_order (INT) - Gallery order
is_published (TINYINT) - Visibility
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
Indexes: youtube_id (UNIQUE), sort_order, is_published
```

### Data Persistence Methods

**Database (MySQL):**
- Users, sessions, articles (if using PHP API exclusively)
- Schema initialized via `api/db_migrate.php` and seeded via `api/db_seed_users.php`

**JSON Files (`src/data/`):**
- Gallery: `gallery.json` - Array of image objects with metadata
- Staff: `staff.json` - Array of staff profiles
- Videos: `videos.json` - Array of video entries with YouTube IDs
- News: `news.school.json`, `news.student.json` - Array of article objects
- Imported: `importedPosts.json` - Content migrated from WordPress

**LocalStorage (Browser):**
- Key: `authToken` - JWT token for authenticated sessions
- Key: `sessionData` - User profile cached after login
- Cleared on logout

**Server Filesystem:**
- Location: `/public/uploads/[category]/`
- File types: JPEG, PNG, WebP (images), JSON (metadata)
- Uploaded via Multer middleware with Sharp optimization

### CRUD Operations

**Create:**
- Articles: Admin posts form → API POST `/api/news/create` → Database INSERT
- Gallery: Admin uploads file → API POST `/api/upload/gallery` → Multer saves file → JSON updated
- Staff: Admin creates profile → API POST `/api/staff/create` → JSON file updated
- Videos: Admin enters YouTube ID → API POST `/api/videos/add` → JSON updated

**Read:**
- Frontend: GET `/api/news/list` → JSON file loaded → Paginated response
- Frontend: GET `/api/gallery` → gallery.json loaded → Array returned
- Frontend: GET `/api/news/detail/:slug` → importedPosts.json searched → Single article returned
- Admin: All data read from respective JSON or database tables

**Update:**
- Articles: Admin edits content → API PATCH `/api/news/:id` → Database UPDATE
- Gallery: Admin edits title → API PATCH `/api/gallery/:id` → gallery.json updated
- Staff: Admin modifies profile → API PATCH `/api/staff/:id` → staff.json updated
- Reordering: Drag-drop interface → API POST `/api/[resource]/reorder` → sort_order field updated

**Delete:**
- Articles: Admin confirms deletion → API DELETE `/api/news/:id` → Database record marked archived
- Gallery: Admin deletes image → API DELETE `/api/gallery/:id` → Removed from gallery.json, file deleted
- Staff: Admin removes profile → API DELETE `/api/staff/:id` → Removed from staff.json
- Soft delete or permanent removal depends on endpoint implementation

### File Uploads & Media Storage

**Upload Flow:**
1. Admin selects file(s) in dashboard
2. JavaScript validates: MIME type (image/jpeg, image/png, image/webp), size (<4MB)
3. FormData created with file + metadata
4. POST to `/api/upload/[category]` with Authorization header
5. Multer middleware:
   - Stores temp file in `server/temp/`
   - Sharp processes image (resize, compress, convert)
   - Moves to `/public/uploads/[category]/[filename]`
   - Returns filename to client
6. Frontend stores filename reference in JSON metadata
7. Public URL: `https://domain.com/uploads/[category]/[filename]`

**Storage Paths:**
- Articles: `/uploads/articles/[article-id]-[timestamp].webp`
- Gallery: `/uploads/gallery/[slugified-title]-[timestamp].webp`
- Staff: `/uploads/staff/[staff-id]-[timestamp].webp`

**Media Limitations:**
- Max file size: 4MB per file
- Allowed formats: JPEG, PNG, WebP
- No executable files (PHP, HTM, etc.) allowed
- Characters sanitized in filenames (no special chars, spaces)

---

## 8. Configuration & Environment

### Path Configuration

**Frontend Paths:**
- API Base URL (dev): `http://localhost:3001/api`
- API Base URL (prod): `https://domain.com/api` (same-origin)
- Static assets: `/assets/`, `/public/`
- Upload URLs: `/uploads/[category]/[filename]`
- Page routes: `/`, `/news`, `/gallery/photos`, `/admin`

**Backend Paths:**
- Uploads base: `../public/uploads/` (relative to server/index.js)
- Data directory: `../src/data/` (JSON files)
- Import path: `../src/data/importedPosts.json`
- PDF views: `./data/pdf-views.json`

**PHP API Paths:**
- Uploads base: `dirname(__DIR__) . '/uploads'` (relative to api/_bootstrap.php)
- Config location: `__DIR__ . '/config.php'` and `'/config.local.php'`
- Schema: `__DIR__ . '/schema.sql'`

### Important Constants

**Site Information (src/lib/seo-utils.js):**
```javascript
SITE_INFO = {
  name: 'SMP Muhammadiyah 35 Jakarta',
  fullName: 'SMP Muhammadiyah 35 Jakarta - Islamic & Global School',
  type: 'Islamic & Global School',
  accreditation: 'A',
  npsn: '20106980',
  phone: '(021) 7210785',
  address: 'Jl. Panjang No.19, RT.8/RW.9, Cipulir, Kebayoran Lama, Jakarta Selatan',
  latitude: '-6.2607',
  longitude: '106.7794',
  url: 'https://smpmuh35jakarta.sch.id',
  email: 'smpmuh35@gmail.com',
  academicYear: '2026/2027'
}
```

**SEO Keywords:** Array of 11+ targeted keywords for school in Indonesian (e.g., "SMP Muhammadiyah 35 Jakarta", "Sekolah Islami Terbaik Jakarta Selatan", "PPDB SMP Muhammadiyah 35 Jakarta")

**Database Configuration (api/config.php):**
```php
'db' => [
  'host' => 'localhost',
  'name' => 'u541580780_smpmuh35',
  'user' => 'u541580780_smpmuh35',
  'charset' => 'utf8mb4'
]
```

**Authentication:**
- JWT Secret: Configured in `api/config.local.php` or environment variable
- Token TTL: 6 hours
- Algorithm: HS256 (HMAC-SHA256)

**reCAPTCHA:**
- Service: Google reCAPTCHA v3 (invisible, bot detection)
- Environment variables: `VITE_RECAPTCHA_SITE_KEY` (frontend), `RECAPTCHA_SECRET_KEY` (backend)
- Backend verification: `POST /api/verify-recaptcha`

**Express Server:**
- Port: 3001 (configurable via `PORT` env var)
- Allowed origins: Configured in CORS middleware
- File size limit: 1MB for JSON, 4MB for multipart uploads
- Request timeout: 10 seconds for external API calls

### Environment Dependencies

**Production Hosting:**
- Web server: Apache, Nginx, or Node.js directly
- PHP version: 7.4+ (for PHP API endpoints)
- Node.js version: >=16.0.0 (for Express backend)
- MySQL/MariaDB: 5.7+
- SSL/TLS certificate (HTTPS recommended)
- Disk space: ~1GB for uploads directory

**Development Environment:**
- Node.js >=16.0.0 with npm or yarn
- npm packages installed via `npm install` (both root and server/)
- PHP CLI for running migration scripts (optional if using Node backend)
- SQLite or MySQL for local database (testing)

**External Dependencies:**
- Google reCAPTCHA: API keys required (site key + secret key)
- Google Fonts: CDN for Poppins and Roboto fonts
- Unsplash: Fallback placeholder images
- YouTube: Video embedding via iframe

**File Permissions:**
- Uploads directory: Read/write access (chmod 755 recommended)
- Config files: Readable by web server, not publicly accessible
- Database backups: Secure location with restricted access

---

## 9. System Summary

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PUBLIC USERS (VISITORS)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │  React Frontend      │
                    │  (HTML/CSS/JS)       │
                    │  Port 3000 (dev)     │
                    └──────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │  HTTP Requests/      │
                    │  Fetch API           │
                    │  /api/* routes       │
                    └──────────────────────┘
                              ↓
         ┌────────────────────────────────────────────┐
         │          Express Backend (Node.js)         │
         │          Port 3001                         │
         │  ┌──────────────────────────────────────┐  │
         │  │  API Routes (Gallery, Staff, News)  │  │
         │  │  File Upload (Multer + Sharp)       │  │
         │  │  reCAPTCHA Verification             │  │
         │  │  JSON Persistence & Caching         │  │
         │  └──────────────────────────────────────┘  │
         └────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────┴──────────────────────────┐
    │                                                      │
    ↓                                                      ↓
┌────────────────┐                           ┌──────────────────┐
│  JSON Files    │                           │  File System     │
│  (Data)        │                           │  (/uploads)      │
│  - news        │                           │  - Images        │
│  - gallery     │                           │  - Photos        │
│  - staff       │                           │  - Metadata      │
│  - videos      │                           │  - PDFs          │
└────────────────┘                           └──────────────────┘
    
┌──────────────────────────────────────────────────────────────┐
│                        ADMIN USERS                           │
│                  (Superadmin/Admin/Author)                   │
└──────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │  Admin Dashboard     │
                    │  (React SPA)         │
                    │  Protected Routes    │
                    └──────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │  Authentication      │
                    │  JWT Token           │
                    │  Role-Based Access   │
                    └──────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │  Admin API Routes    │
                    │  Create/Read/Update/ │
                    │  Delete Operations   │
                    └──────────────────────┘
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
        ┌──────────────┐              ┌──────────────┐
        │  Database    │              │  JSON Files  │
        │  (MySQL)     │              │  (Fallback)  │
        │  - users     │              │  - Data      │
        │  - sessions  │              │  - Metadata  │
        │  - articles  │              │  - Cache     │
        └──────────────┘              └──────────────┘
```

### Primary System Purpose

This is a **comprehensive school information & content management system** designed for SMP Muhammadiyah 35 Jakarta. The system serves dual purposes:

1. **Public-Facing Website:**
   - Presents school information, programs, achievements, and latest news
   - Facilitates student registration (PPDB) with security measures (reCAPTCHA, input sanitization)
   - SEO-optimized for search engine visibility
   - Mobile-responsive design for accessibility
   - Progressive Web App (PWA) capable

2. **Administrative Backend (CMS):**
   - Superadmin can manage all content (news, articles, gallery, staff, videos)
   - Admin role for content management
   - Author role for limited article creation
   - File upload handling with image optimization
   - Role-based access control with JWT authentication
   - Drag-drop reordering and WYSIWYG editing

### System Workflow: End-to-End

**Visitor Journey:**
1. User visits homepage `https://smpmuh35jakarta.sch.id/`
2. Frontend loads React app from `/dist/index.html`
3. Vite or production server serves compiled JavaScript and CSS
4. Homepage renders with sections: hero, welcome, pricing, news, gallery, staff, facilities
5. User reads news articles, views gallery images, watches videos, or fills registration form
6. Registration form submission triggers reCAPTCHA verification via backend
7. Backend validates captcha token with Google, then processes registration
8. Response returned to frontend, success/error notification displayed

**Admin Workflow:**
1. Admin navigates to `/admin` protected route
2. Redirected to login form if not authenticated
3. Login with email/password, backend returns JWT token
4. Token stored in localStorage
5. Admin dashboard loads with role-based menu items
6. Admin selects "Media Library" (Gallery Management)
7. Admin uploads gallery images (files processed by Multer + Sharp)
8. Images appear in list with drag-drop reordering
9. Changes saved to gallery.json and `/public/uploads/gallery/`
10. Homepage gallery section auto-updates with new images

**Content Update Flow:**
1. Admin clicks "News School" in dashboard
2. Loads NewsManager component (lists existing articles)
3. Admin clicks "Create New Article"
4. Opens form with Quill rich text editor for HTML content
5. Admin fills title, content, featured image, SEO metadata
6. Submits form via API POST `/api/news/create`
7. Backend validates token (JWT), checks role permissions (Admin/Superadmin)
8. Article saved to database (articles table) or JSON file
9. Featured image uploaded and stored in `/uploads/articles/`
10. Toast notification confirms success
11. Article appears on homepage news section and `/news/` page (live)

### System Limitations Observable from Code

1. **Concurrency:** No real-time sync between multiple admin instances editing simultaneously (last-write-wins)
2. **Search Functionality:** No full-text search implemented; limited to pagination and category filtering
3. **Caching:** JSON files read fresh on every API call; no redis or application-level caching
4. **Video Hosting:** Videos sourced from YouTube only (via embed); no local video hosting
5. **Database Scaling:** JSON file persistence not suitable for very large datasets; database queries would be needed
6. **Offline Capability:** PWA manifest present but service worker implementation not evident in code
7. **Internationalization:** UI hardcoded in Indonesian; no multi-language support visible
8. **File Management:** No bulk operations for gallery/staff; one file at a time
9. **Backup & Recovery:** No automated backup mechanism for JSON files or database
10. **Rate Limiting:** No apparent rate limiting on API endpoints (except reCAPTCHA on registration)
11. **Email Notifications:** No email integration for registration confirmations or notifications
12. **Reporting:** No analytics dashboard or reporting features for admin

### Security Features Implemented

- ✅ Google reCAPTCHA v3 bot protection on registration
- ✅ Input sanitization (XSS prevention via sanitize.js)
- ✅ JWT authentication with HS256 signature validation
- ✅ bcrypt password hashing for user credentials
- ✅ Role-based access control (RBAC) on all admin endpoints
- ✅ CORS configuration to restrict cross-origin requests
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Prepared SQL statements (PDO in PHP) prevent SQL injection
- ✅ File upload validation (MIME type, size, extension)
- ✅ No executable files allowed in uploads directory
- ✅ Session tracking with IP and User-Agent logging
- ✅ HTTPS-ready configuration (in production)

---

## Appendix: File-to-File Relationships

### Frontend Component Dependencies

- **App.jsx** imports and renders:
  - Navigation, Footer, BackToTop (layout)
  - All page sections (Hero, Welcome, Pricing, etc.)
  - ArticleDetail, StaffPage, GalleryIndexPage (routed components)
  - AdminDashboard (protected route)

- **AdminDashboard.jsx** imports:
  - NewsManager, GalleryManager, StaffManager, VideoManager (sub-components)
  - authApi.js for login/logout
  - db.js for session persistence

- **ArticleDetail.jsx** imports:
  - articlesApi.js for fetching article content
  - seo-utils.js for meta tags and structured data

- **GalleryManager.jsx** imports:
  - galleryApi.js for upload/delete/reorder operations
  - sanitize.js for input validation

- **Navigation.jsx** imports:
  - React Router hooks for navigation
  - Icons from lucide-react

### Backend File Dependencies

- **server/index.js** imports and uses:
  - Express, CORS, Multer, Sharp (external libraries)
  - api/verify-recaptcha.js (reCAPTCHA verification router)
  - Filesystem operations for JSON persistence
  - path, fs modules for file handling

- **api/_bootstrap.php** includes:
  - config.php (database credentials)
  - config.local.php (environment overrides)
  - Defines helper functions used by all api/* endpoints

- **api/auth/login.php** uses:
  - _bootstrap.php (db connection, helpers)
  - pdo for user query
  - password_verify() for authentication
  - JWT generation

- **api/articles/create.php** uses:
  - _bootstrap.php (auth, db, helpers)
  - file upload functions
  - database insert for article storage

### Data File Dependencies

- **src/App.jsx** reads from:
  - src/lib/seo-utils.js (SITE_INFO constants)
  - src/data/news.school.json (via API call)
  - src/data/gallery.json (via API call)

- **server/index.js** loads:
  - src/data/importedPosts.json (news articles)
  - src/data/gallery.json (gallery metadata)
  - src/data/staff.json (staff profiles)
  - src/data/videos.json (video metadata)
  - server/data/pdf-views.json (PDF tracking)

- **Admin components** write to:
  - src/data/gallery.json (via API POST /api/gallery/reorder)
  - src/data/staff.json (via API POST /api/staff/reorder)
  - src/data/videos.json (via API POST /api/videos/reorder)

---

**Document Status:** Complete System Archive Documentation  
**Last Updated:** January 9, 2026  
**Intended Audience:** Developers, Technical Auditors, Compliance Stakeholders
