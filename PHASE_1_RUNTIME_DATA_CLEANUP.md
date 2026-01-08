# Phase 1 – Runtime Data Cleanup

## Objective
Remove all JSON/static runtime usage and enforce PHP/MySQL as the sole data source. No fallbacks to local files or static datasets remain.

## Files Modified
- [src/lib/fetchWithFallback.js](src/lib/fetchWithFallback.js) – Removed static imports and all JSON fallbacks; news/article fetch now calls PHP API only and throws on failure. Removed PDF/static helpers.
- [src/config/staticMode.js](src/config/staticMode.js) – Disabled static mode (`STATIC_MODE = false`).
- [src/components/pages/NewsListPage.jsx](src/components/pages/NewsListPage.jsx) – Uses PHP news API only; no db/local fallbacks.
- [src/pages/news/NewsListPage.jsx](src/pages/news/NewsListPage.jsx) – Same PHP-only behavior; errors surface to UI.
- [src/components/NewsSection.jsx](src/components/NewsSection.jsx) – PHP-only news fetch with explicit error display.
- [src/components/ArticleDetail.jsx](src/components/ArticleDetail.jsx) – Removed local db fallback; errors surface if API fails.
- [src/components/pages/PhotoGallery.jsx](src/components/pages/PhotoGallery.jsx) – Gallery pulled from PHP API; static gallery data removed; explicit loading/error states.
- [src/components/GallerySection.jsx](src/components/GallerySection.jsx) – Homepage gallery reads PHP API; static data removed; error/empty states added.
- [src/components/admin/StaffManager.jsx](src/components/admin/StaffManager.jsx) – Removed static storage import/default import button; PHP API is sole path.
- [src/components/admin/DashboardHome.jsx](src/components/admin/DashboardHome.jsx) – Stats now sourced via PHP APIs (articles, registrants); no local JSON/log usage.

## Behavior Changes
- Public news, article detail, and gallery now depend exclusively on PHP APIs; failures show user-facing errors instead of silent local data.
- Static gallery/photo datasets removed; data always comes from `/api/gallery/list.php`.
- Static mode disabled; no runtime JSON/import fallbacks are available.
- Admin dashboard stats derive from PHP endpoints (articles, PPDB) and no longer read local storage.

## Proof of Cleanup
- Workspace search shows **no** `@/data/` imports in `src/**`.
- No components call `db.getNews()` or other local JSON readers for runtime content (only API-backed calls remain).
- Fallback helpers now throw errors instead of substituting static data.

## Status
PASS – Runtime data is sourced solely from PHP/MySQL. No JSON/static fallbacks remain in React runtime paths.
