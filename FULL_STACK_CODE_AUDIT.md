# Full Stack Code Audit Report (PHP + MySQL + JSX)

## 1. Project Overview
- School CMS for articles/news, gallery, staff, videos; mix of PHP REST-style endpoints and a Node/Express helper API; React frontend with static-mode fallbacks.
- Stack: PHP 7/8 with PDO + MySQL, JWT auth; file uploads to /uploads; React/Vite frontend; auxiliary Node Express server for JSON/file operations and reCAPTCHA proxy.

## 2. Repository Structure Analysis
- PHP API under api/ (articles, news, auth, staff, gallery, videos, settings, recaptcha, setup) sharing bootstrap/config.
- Public assets/uploads under public/ and uploads/; data/ holds published JSON exports; src/ contains React app with libs, pages, components, static data; server/ contains Express API and upload handlers.

## 3. Backend (PHP) Audit Findings
- Issue ID: B1
  - Severity: Critical
  - File(s): [api/config.php](api/config.php#L1-L17), [api/config.local.php](api/config.local.php#L1-L17)
  - Category: Configuration
  - Description: Hardcoded production DB credentials and JWT secret committed in repo with identical values in config and override file; no separation for environments.
  - Potential Impact: Credential leakage risk; compromise of DB and JWT signing allows impersonation and data tampering.
- Issue ID: B2
  - Severity: High
  - File(s): [api/_bootstrap.php](api/_bootstrap.php#L5-L74)
  - Category: Security
  - Description: CORS reflects any Origin when header present and allows credentials; no allowed-origins whitelist.
  - Potential Impact: Opens cross-site token theft and CSRF-like abuse when frontend stores tokens client-side.
- Issue ID: B3
  - Severity: High
  - File(s): [api/auth/login.php](api/auth/login.php#L6-L82)
  - Category: Security
  - Description: JWTs signed with static shared secret and no rotation; sessions table insert is best-effort without verification on subsequent calls (logout ignores sessions).
  - Potential Impact: Token replay cannot be revoked server-side; secret leakage breaks auth integrity.
- Issue ID: B4
  - Severity: High
  - File(s): [api/articles/create.php](api/articles/create.php#L6-L156), [api/articles/update.php](api/articles/update.php#L6-L116)
  - Category: Security
  - Description: Upload handling depends on validate_image_upload but relies on extension-based naming; update path lacks .htaccess/writability safeguards present in create; removes executable checks only via validate_image_upload.
  - Potential Impact: Malicious uploads may persist if MIME spoofing bypasses finfo, and inconsistent hardening between create/update increases attack surface.
- Issue ID: B5
  - Severity: Medium
  - File(s): [api/news/list.php](api/news/list.php#L4-L53), [src/pages/news/NewsListPage.jsx](src/pages/news/NewsListPage.jsx#L35-L153)
  - Category: Logic
  - Description: Backend list endpoint ignores requested category/channel while frontend tab switch assumes category filtering; pagination counts all articles.
  - Potential Impact: Users see mixed categories; UI state desynchronizes from expectation and SEO/category pages are misleading.
- Issue ID: B6
  - Severity: Medium
  - File(s): [api/articles/update.php](api/articles/update.php#L87-L111)
  - Category: Data
  - Description: Updating an article resets published_at to "now" whenever status is set to published, discarding original publish time; draft toggle nulls the date without preserving previous value.
  - Potential Impact: Timeline/order changes unexpectedly; pagination/sorting and SEO dates become inconsistent.
- Issue ID: B7
  - Severity: Medium
  - File(s): [api/settings/update.php](api/settings/update.php#L6-L43)
  - Category: Data
  - Description: Arbitrary JSON strings stored without schema validation for allowed keys; no type checking or size limits.
  - Potential Impact: Corrupt settings data can break frontend rendering or SEO metadata; potential large payload storage.
- Issue ID: B8
  - Severity: Medium
  - File(s): [api/staff/publish.php](api/staff/publish.php#L4-L30), [api/staff/publish(1).php](api/staff/publish(1).php#L6-L35)
  - Category: Logic
  - Description: Duplicate publish scripts with different behaviors (one POST-protected toggle, one CLI-style writer to JSON) with overlapping names; no routing guard to prevent unintended execution.
  - Potential Impact: Ambiguous deployment/automation; possible wrong script invoked leading to stale or unintended JSON exports.
- Issue ID: B9
  - Severity: Low
  - File(s): [api/_bootstrap.php](api/_bootstrap.php#L16-L31)
  - Category: Security
  - Description: OPTIONS preflight returns 204 without checking allowed origins/headers beyond reflection.
  - Potential Impact: Broad attack surface for CORS preflights; minor but coupled with permissive CORS increases risk.
- Issue ID: B10
  - Severity: Low
  - File(s): [api/gallery/list.php](api/gallery/list.php#L4-L35), [api/staff/list.php](api/staff/list.php#L4-L35), [api/videos/list.php](api/videos/list.php#L4-L34)
  - Category: Data
  - Description: Pagination limits clamped but no validation of sort fields; relies on is_published flag but accepts published query param free-form; uses COUNT(*) without same WHERE in some cases (gallery/videos consistent, staff uses ternary duplicated inline).
  - Potential Impact: Possible inconsistent totals vs filters; minor correctness issues.

## 4. Database & Query Assumptions
- Articles table requires unique slug, content_html not null; queries expect columns featured_image_alt, category, tags_json, status, seo fields, author_name, published_at, sort_order ([api/articles/create.php](api/articles/create.php#L110-L142), [api/articles/update.php](api/articles/update.php#L98-L115)).
- News detail expects status="published" and category column present ([api/news/detail.php](api/news/detail.php#L19-L36)); list ignores category and author_name field not selected though frontend displays authorName.
- Staff table uses is_published, sort_order; photo_filename nullable; JSON publish export writes photo_url by concatenation ([api/staff/publish.php](api/staff/publish.php#L12-L28)).
- Gallery uses filename, alt_text, is_published, sort_order; uploads assume directory write access and unique_filename to avoid collisions ([api/gallery/upload.php](api/gallery/upload.php#L7-L49)).
- Videos table assumes youtube_id uniqueness enforced in schema; CRUD uses title/youtube_id and optional thumbnail/description ([api/videos/create.php](api/videos/create.php#L6-L40), [api/videos/update.php](api/videos/update.php#L6-L38)).
- Settings table stores arbitrary text keyed by `key`; no schema validation ([api/settings/update.php](api/settings/update.php#L17-L42)).

## 5. Frontend (JSX / React) Audit Findings
- State management relies on fetchWithFallback with AbortController timeouts; static mode default true causing backend calls to abort after 3–5s and fall back silently ([src/config/staticMode.js](src/config/staticMode.js#L5-L40), [src/lib/fetchWithFallback.js](src/lib/fetchWithFallback.js#L12-L77)).
- News list page assumes category parameter and uses pagination from API; expects items fields: title, excerpt, featuredImage, category, authorName, readTime ([src/pages/news/NewsListPage.jsx](src/pages/news/NewsListPage.jsx#L23-L120)). Backend does not supply readTime/category filtering.
- ArticleDetail renders article.content via dangerouslySetInnerHTML without sanitization; trusts backend/stored HTML ([src/components/ArticleDetail.jsx](src/components/ArticleDetail.jsx#L296-L324)).
- API clients assume `success` flag wrapping data for most endpoints (articles/staff/gallery/videos/settings) while news list/detail return plain structures, handled via fallback util that probes multiple field names ([src/lib/articlesApi.js](src/lib/articlesApi.js#L1-L80), [src/lib/fetchWithFallback.js](src/lib/fetchWithFallback.js#L28-L77)).
- Admin API callers send Authorization header from localStorage token; no refresh/expiry handling; static mode may bypass network errors leading to silent staleness.

## 6. API Contract & Integration Conflicts
- News category mismatch: frontend passes category but [api/news/list.php](api/news/list.php#L19-L34) ignores it; Node server’s /api/news/list supports category, creating divergent behavior.
- Field naming: frontend expects `featuredImage`, `authorName`, `readTime`, `category`; PHP list returns featuredImage derived only from featured_image and no category/readTime ([api/news/list.php](api/news/list.php#L25-L44)).
- Success envelope: PHP news endpoints return raw {items,pagination} and {record}; React utilities cope, but other API clients expect {success,message,data}, causing inconsistent error handling paths.
- Publishing flags: frontend listStaff/listGallery default includeUnpublished=true causing published=0 param; backend interprets as publishedOnly=0 (returns drafts) but pagination total uses same WHERE only when publishedOnly set; subtle mismatch on totals ([api/staff/list.php](api/staff/list.php#L5-L31)).
- Article update/create FormData fields use `content`; backend accepts content or content_html; other callers might send content_html, creating dual field expectations ([api/articles/update.php](api/articles/update.php#L17-L30)).

## 7. Cross-Stack Conflicts
- Two news backends: PHP under /api/news/*.php and Node Express /api/news/list|detail; schemas differ (PHP uses status/published_at, Node uses importedPosts.json with readTime/channel). Risk of inconsistent data depending on deployment route selection ([server/index.js](server/index.js#L60-L177)).
- Upload paths differ: PHP writes to uploads/{articles,gallery,staff,videos} under project root; Node writes to public/uploads/{gallery,staff,news}. URLs collide under /uploads but storage roots differ, causing missing files when switching stacks.
- Static mode default true causes frontend to favor local JSON over live PHP APIs, potentially hiding backend errors and causing stale content despite successful admin updates.

## 8. Consistency Review
- Naming: Backend uses snake_case in DB and response keys; frontend expects camelCase (`featuredImage`, `authorName`), with ad-hoc mapping in news detail only; list responses leak snake_case keys (featured_image_url) to clients ([api/articles/list.php](api/articles/list.php#L24-L40)).
- Responsibility boundaries: Publishing/export scripts coexist with runtime APIs (publish.php vs publish(1).php); Node server duplicates gallery/staff/video CRUD with JSON storage while PHP uses MySQL.
- Data flow: Some endpoints wrap respond(); news endpoints bypass respond(); settings endpoints store JSON blobs without schema; auth sessions not enforced across endpoints.

## 9. Risk Summary
- Highest risk areas: Exposed credentials/JWT secret; permissive CORS with credentials; inconsistent upload hardening; dual backend conflict; unsanitized HTML rendering in frontend coupled with trusted content.
- Medium risk areas: Category/pagination mismatches, published_at overwrite, settings free-form storage, duplicate publish scripts, static-mode masking backend failures.
- Stable areas: Basic CRUD use prepared statements; image MIME/type checks present; pagination limits clamped; schema indexes for status/sort.

## 10. Audit Conclusion
- Overall health is mixed: core CRUD is straightforward and mostly prepared, but security posture is weak due to committed secrets and permissive CORS; data integrity suffers from inconsistent publishing logic and dual backends. Frontend relies on static fallbacks that obscure backend correctness, leading to potential content drift. Strengthening configuration hygiene, aligning API contracts, and removing duplicated service layers are key to stabilizing this stack.
