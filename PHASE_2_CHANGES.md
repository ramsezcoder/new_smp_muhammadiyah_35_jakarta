# Phase 2 — Data Consolidation: Changes

Frontend:
- Deleted `src/lib/db.js` and removed all imports/usages.
- Deleted `src/config/staticMode.js` and `src/lib/staticStorage.js` (static mode eliminated).
- Admin Dashboard:
  - `AdminDashboard.jsx`: replaced `db.getSession()`/`db.logout()` with `apiVerify()`/`apiLogout()` using `app_session` token.
  - `admin/DashboardHome.jsx`: now calls `/api/admin/dashboard-stats.php` and renders response only.
  - `admin/RegistrantManager.jsx`: uses `/api/ppdb/list.php` and `/api/ppdb/delete.php`; mapped fields to API.
  - `admin/GalleryManager.jsx`: removed `db` and `MESSAGES`; implemented local filename base and generic messages.
  - `admin/StaffManager.jsx` and `admin/VideoManager.jsx`: removed `MESSAGES` and used generic success/error.
- Terminology cleanup:
  - `src/lib/fetchWithFallback.js`: renamed exports to `fetchNews` and `fetchArticle`; updated all imports.

Backend (PHP):
- Added `public/api/admin/dashboard-stats.php` returning `{ articles_total, articles_pending, registrants_total, registrants_new }` using MySQL.
