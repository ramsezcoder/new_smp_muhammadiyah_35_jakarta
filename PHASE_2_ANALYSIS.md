# Phase 2 — Data Consolidation: Analysis

Objectives:
- Enforce PHP + MySQL as the only source of truth at runtime.
- Remove frontend database abstraction and static/fallback concepts.
- Centralize Admin Dashboard statistics via a single PHP endpoint.

Findings:
- `src/lib/db.js` was imported in Admin components (`AdminDashboard.jsx`, `admin/DashboardHome.jsx`, `admin/RegistrantManager.jsx`, `admin/GalleryManager.jsx`).
- Static mode config existed in `src/config/staticMode.js` and `src/lib/staticStorage.js`; several Admin components imported `MESSAGES`.
- News helpers named `fetchNewsWithFallback` and `fetchArticleWithFallback` implied dual-source semantics.

Impact:
- Session handling in Admin needed to use PHP auth endpoints.
- Registrants module needed to switch to existing PHP PPDB endpoints.
- Gallery/Staff/Video managers needed message cleanup, no static fallback coupling.
