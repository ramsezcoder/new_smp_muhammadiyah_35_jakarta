# Phase 1 – Frontend API Audit

## Search Methodology
- Searched all frontend sources (`src/**`) for `fetch(`/api`, `axios(`/api`, and bare `/api/` usage.
- Included components, pages, and all `src/lib` utilities.
- Post-change re-ran the same queries to confirm only PHP endpoints remain.

## Findings & Classification

| File | Line | Endpoint | Classification | Notes |
|------|------|----------|----------------|-------|
| src/lib/articlesApi.js | 23 | /api/articles/list.php | ✅ VALID | PHP list endpoint |
| src/lib/articlesApi.js | 50 | /api/articles/create.php | ✅ VALID | PHP create |
| src/lib/articlesApi.js | 81 | /api/articles/update.php | ✅ VALID | PHP update |
| src/lib/articlesApi.js | 94 | /api/articles/delete.php | ✅ VALID | PHP delete |
| src/lib/articlesApi.js | 107 | /api/articles/reorder.php | ✅ VALID | PHP reorder |
| src/lib/authApi.js | 2 | /api/auth/login.php | ✅ VALID | PHP auth |
| src/lib/authApi.js | 15 | /api/auth/verify.php | ✅ VALID | PHP auth verify |
| src/lib/authApi.js | 26 | /api/auth/logout.php | ✅ VALID | PHP logout |
| src/lib/db.js | 523 | /api/ppdb/list.php | ✅ VALID | PHP PPDB list |
| src/lib/db.js | 550 | /api/ppdb/save.php | ✅ VALID | PHP PPDB save |
| src/lib/db.js | 561 | /api/ppdb/delete.php | ✅ VALID | PHP PPDB delete |
| src/lib/fetchWithFallback.js | 25 | /api/news/list.php | ✅ VALID | PHP news list |
| src/lib/fetchWithFallback.js | 61 | /api/news/detail.php | ✅ VALID | PHP news detail |
| src/lib/fetchWithFallback.js | — | (PDF API removed) | ✅ VALID | PDF tracking now static; no API call |
| src/lib/galleryApi.js | 23 | /api/gallery/list.php | ✅ VALID | PHP gallery list |
| src/lib/galleryApi.js | 42 | /api/gallery/upload.php | ✅ VALID | PHP upload |
| src/lib/galleryApi.js | 55 | /api/gallery/delete.php | ✅ VALID | PHP delete |
| src/lib/galleryApi.js | 68 | /api/gallery/reorder.php | ✅ VALID | PHP reorder |
| src/lib/galleryApi.js | 81 | /api/gallery/update_meta.php | ✅ VALID | PHP meta update |
| src/lib/settingsApi.js | 19 | /api/settings/get.php | ✅ VALID | PHP settings get |
| src/lib/settingsApi.js | 30 | /api/settings/update.php | ✅ VALID | PHP settings update |
| src/lib/staffApi.js | 23 | /api/staff/list.php | ✅ VALID | PHP staff list |
| src/lib/staffApi.js | 43 | /api/staff/create.php | ✅ VALID | PHP staff create |
| src/lib/staffApi.js | 67 | /api/staff/update.php | ✅ VALID | PHP staff update |
| src/lib/staffApi.js | 80 | /api/staff/delete.php | ✅ VALID | PHP staff delete |
| src/lib/staffApi.js | 93 | /api/staff/reorder.php | ✅ VALID | PHP staff reorder |
| src/lib/videosApi.js | 23 | /api/videos/list.php | ✅ VALID | PHP videos list |
| src/lib/videosApi.js | 34 | /api/videos/create.php | ✅ VALID | PHP videos create |
| src/lib/videosApi.js | 47 | /api/videos/update.php | ✅ VALID | PHP videos update |
| src/lib/videosApi.js | 60 | /api/videos/delete.php | ✅ VALID | PHP videos delete |
| src/lib/videosApi.js | 73 | /api/videos/reorder.php | ✅ VALID | PHP videos reorder |
| src/components/RegistrationSection.jsx | 77 | /api/ppdb/submit.php | ✅ VALID | PHP PPDB submit |
| src/components/pages/NewsListPage.jsx | 104 | /api/news/list.php | ✅ VALID | PHP news list check |

## Invalid/Unclear Calls Resolved
- `src/components/pages/NewsListPage.jsx` previously used Express-style `/api/news/list`; updated to `/api/news/list.php`.
- `src/lib/fetchWithFallback.js` previously called `/api/pdf/views` and `/api/pdf/view/:id` (Express-only). No PHP equivalent exists, so API calls were removed and PDF tracking now operates in static mode to avoid hitting deprecated backend.

## Conclusion
- All frontend API calls now target PHP `.php` endpoints exclusively, or operate in static mode where no PHP endpoint exists.
- No Express-style endpoints remain in frontend code.
- PDF view tracking depends on future PHP support; currently disabled to prevent Express dependency.

**Status:** PASS (frontend now PHP-only; Express usage eliminated)
