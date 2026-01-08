# Phase 1 – Validation (Single Authority)

## Checks Performed
- Confirmed Vite proxy now targets PHP backend via configurable `VITE_API_TARGET` (default `http://localhost:8000`); no reference to `localhost:3001` remains in vite.config.js.
- Verified Node/Express startup scripts immediately exit with deprecation notice, preventing accidental Express launches.
- Added explicit legacy marker in server/DEPRECATED.md to document non-authoritative status.

## Outcomes
- **Pass**: Development traffic to `/api/*` is routed to PHP backend by default.
- **Pass**: Express backend cannot be started via provided scripts; any attempt surfaces guidance to use PHP.
- **Pass**: Project now contains written evidence of backend authority and Express deprecation.

## Remaining Risks / Follow-ups
- Documentation still references port 3001 (legacy); update or supersede in later phases to prevent confusion.
- JSON-backed data still exists in code paths (Express legacy, frontend); to be addressed in Phase 2.

### Frontend API Audit Validation
- Confirmed all frontend API calls resolve to PHP `.php` endpoints; no Express-style routes remain.
- Updated NewsListPage check to `/api/news/list.php`.
- Removed Express-only PDF view endpoints; PDF tracking now runs in static mode until a PHP endpoint exists.
- See PHASE_1_FRONTEND_API_AUDIT.md for full call inventory and classifications.

### Runtime Data Authority Validation
- React no longer imports or uses any `@/data/*` JSON at runtime; static mode disabled.
- News, article detail, and gallery views fetch exclusively from PHP APIs and surface errors instead of falling back to local data.
- Admin dashboard stats sourced from PHP endpoints (articles, PPDB); static storage/default import paths removed.
- See PHASE_1_RUNTIME_DATA_CLEANUP.md for detailed changes.

## Gate Decision
- Phase 1 accepted. Proceed to Phase 2 (Data Consolidation) with PHP as the sole backend authority.
