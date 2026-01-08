# Deprecated Backend (Node/Express)

- This directory contains the legacy Express backend that previously ran on port 3001.
- It is **not** part of production or development runtime. PHP under /api is the only backend.
- Do not run npm start/dev here. Use a PHP server (e.g., php -S localhost:8000 -t public) and point Vite via VITE_API_TARGET.
- Artifacts remain only for reference; they are non-authoritative.
