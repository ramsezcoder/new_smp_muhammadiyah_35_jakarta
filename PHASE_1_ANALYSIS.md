# Phase 1 – Analysis (Declare Single Authority)

## Scope
- Establish which backend is authoritative and what must be removed or isolated.
- Identify all touch points that currently route to the Node/Express server.

## What Was Analyzed
- Express backend implementation at server/index.js (JSON-backed, unauthenticated routes).
- Vite development proxy pointing `/api` to Express at localhost:3001 in vite.config.js.
- Node start wrappers start-backend.sh and start-backend.bat that install deps and launch Express.
- Presence of PHP API stack in api/ (full JWT auth, PPDB, CRUD).

## Key Findings
- Express server binds to port 3001 and serves `/api/news/*`, gallery/staff/videos CRUD, uploads, PDF tracking, and static `dist/` output; all backed by JSON files, no auth.
- Vite dev proxy sends every `/api/*` request to Express (`target: http://localhost:3001`), making Express the default runtime during development.
- Start scripts auto-install and start Express, reinforcing it as the implicit backend.
- PHP API already provides the complete authenticated backend with MySQL (auth, RBAC, PPDB, CRUD, uploads).

## Decision Inputs
- Non-negotiable architecture: PHP is the sole backend; MySQL is the sole data source; `/api/*` must be PHP-only.
- Goal: remove Express from the critical path and prevent accidental use in dev/prod.

## Plan for Phase 1
1. Redirect dev API traffic to PHP (configurable target) and remove the 3001 dependency.
2. Disable Express launch scripts to block accidental startup.
3. Mark Express backend as legacy/non-authoritative for audit clarity.
4. Document changes and validation steps before proceeding to Phase 2.
