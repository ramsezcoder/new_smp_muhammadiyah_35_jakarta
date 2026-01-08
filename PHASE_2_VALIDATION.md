# Phase 2 — Data Consolidation: Validation

Hard Gate Criteria:
- [x] `src/lib/db.js` does not exist
- [x] No React file imports `db.*`
- [x] No static mode concept exists (`src/config/staticMode.js`, `src/lib/staticStorage.js` removed)
- [x] Admin dashboard uses PHP-only stats (`/api/admin/dashboard-stats.php`)
- [x] Backend failure results in explicit error UI (existing error messaging retained in views)

Verification Notes:
- Grep confirms zero matches for `@/lib/db` and `@/config/staticMode`.
- `admin/DashboardHome.jsx` fetches stats via one endpoint and handles non-OK responses.
- Registrants module fetches and deletes using PHP PPDB endpoints.
- News helpers and components no longer use any fallback terminology or dual-source behavior.
