# Phase 1 – Changes (Declare Single Authority)

## Summary of Changes
- Redirected Vite dev proxy to PHP backend and removed hardcoded Express target.
- Disabled Node/Express startup scripts to prevent accidental use.
- Marked Express backend directory as legacy/non-authoritative.

## Files Touched
- [vite.config.js](vite.config.js) – Proxy now uses configurable `VITE_API_TARGET` (defaults to `http://localhost:8000`) instead of `http://localhost:3001`.
- [start-backend.sh](start-backend.sh) – Replaced with deprecation notice; exits with failure to block Express startup.
- [start-backend.bat](start-backend.bat) – Same deprecation notice and exit to block Express startup.
- [server/DEPRECATED.md](server/DEPRECATED.md) – Documents Express backend as archival only.

## Behavior Impact
- Dev requests to `/api/*` now forward to the PHP backend target; Express is no longer reachable via the Vite proxy.
- Attempting to run the old Node startup scripts fails fast with guidance to use PHP.
- Express code is explicitly labeled legacy to avoid ambiguity.

## Rationale
- Enforces the single-backend rule (PHP + MySQL only).
- Removes Express from the critical path and from default developer workflows.
- Reduces risk of deploying or testing against the wrong backend.

## Next Steps (Phase 2 Prereqs)
- Migrate all runtime data off JSON and into MySQL.
- Confirm all PHP endpoints fully cover CRUD/auth/PPDB before JSON deprecation.
