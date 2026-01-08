# Conflict Resolution & Architectural Decision Record (ADR)

## Project
SMP Muhammadiyah 35 Jakarta – Website & CMS System

## Document Type
Conflict Resolution & System Authority Decision

## Date
January 9, 2026

## Decision Scope
This document resolves architectural conflicts, data inconsistencies, and backend ambiguity identified in the *System Validation & Conflict Report*.

This document defines:
- What MUST be preserved
- What MUST be deprecated
- What MUST be considered the single source of truth
- Which architecture is the most stable and realistic to maintain

No code changes are prescribed in this document.

---

## 1. Root Cause Summary

Based on validation findings, the system suffers from **architectural ambiguity**, caused by:

1. Two parallel backend systems (Node.js Express and PHP) operating simultaneously
2. Multiple data persistence mechanisms (MySQL + JSON + localStorage)
3. Overlapping API namespaces (`/api/*`) with different implementations
4. No declared backend authority
5. Partial migration without decommissioning legacy components

This results in:
- Data desynchronization
- Runtime ambiguity
- Deployment uncertainty
- High maintenance risk

---

## 2. Identified Conflict Categories

| Category | Description |
|--------|------------|
| Backend Authority | Node.js vs PHP both act as backend |
| Data Source | Database vs JSON files |
| API Routing | Same endpoints served by different systems |
| Authentication | PHP-only JWT, none in Express |
| Upload Storage | Different upload directories |
| Content Ownership | Admin edits ≠ Public display |

---

## 3. Architectural Options Evaluated

### Option A: Node.js Express as Primary Backend
**Status:** ❌ Not Recommended

**Reasons:**
- No authentication system
- No PPDB endpoint
- No admin role enforcement
- Reads static JSON data only
- Admin CMS depends on PHP endpoints

**Risk Level:** HIGH  
**Migration Cost:** VERY HIGH  
**Breakage Risk:** CRITICAL

---

### Option B: Hybrid Backend (Node.js + PHP)
**Status:** ❌ Not Recommended

**Reasons:**
- Requires reverse proxy rules per endpoint
- Two JWT systems cannot interoperate
- Multiple data sources remain active
- Increases operational complexity
- Error-prone in shared hosting environments

**Risk Level:** VERY HIGH  
**Operational Complexity:** EXTREME  
**Long-Term Maintainability:** LOW

---

### Option C: PHP Backend as Single Source of Truth
**Status:** ✅ RECOMMENDED (BEST OPTION)

**Reasons:**
- Complete authentication & RBAC already implemented
- PPDB fully implemented in PHP
- Database-backed system is authoritative
- Admin CMS already built against PHP endpoints
- Compatible with shared hosting
- Lower migration cost
- Predictable deployment model

**Risk Level:** LOW  
**Migration Cost:** MODERATE  
**Maintainability:** HIGH

---

## 4. Final Architectural Decision

### ✅ DECISION: PHP BACKEND IS THE CANONICAL SYSTEM

**Effective Authority:**
- PHP (`/api/`) is the **ONLY authoritative backend**
- MySQL database is the **ONLY source of truth**
- Node.js Express backend is **non-authoritative**

This decision resolves:
- Backend duplication
- Data desynchronization
- Authentication conflicts
- API ambiguity
- Upload path inconsistency

---

## 5. Conflict Resolution Matrix

### 5.1 Backend Systems

| Component | Resolution |
|--------|------------|
| PHP Backend (`/api/`) | ✅ Retain as primary |
| Node.js Express | ❌ Decommission or restrict |
| Express API routes | ❌ Disable or archive |
| Express static serving | ❌ Not used in production |

---

### 5.2 Data Persistence

| Data Type | Resolution |
|---------|------------|
| Users | ✅ MySQL |
| Sessions | ✅ MySQL |
| Articles / News | ✅ MySQL |
| Gallery | ✅ MySQL |
| Staff | ✅ MySQL |
| Videos | ✅ MySQL |
| JSON files (`src/data/`) | ❌ Treated as legacy / import-only |
| LocalStorage | ⚠️ Session cache only |

---

### 5.3 API Endpoints

| Endpoint Type | Resolution |
|-------------|------------|
| `/api/auth/*` | ✅ PHP only |
| `/api/articles/*` | ✅ PHP only |
| `/api/gallery/*` | ✅ PHP only |
| `/api/staff/*` | ✅ PHP only |
| `/api/videos/*` | ✅ PHP only |
| `/api/ppdb/*` | ✅ PHP only |
| `/api/news/*` (Express) | ❌ Deprecated |

---

### 5.4 Frontend API Consumption

| Area | Resolution |
|----|------------|
| Admin Dashboard | PHP endpoints only |
| Public Pages | PHP endpoints only |
| News List | PHP database articles |
| Gallery Display | PHP gallery table |
| Staff Display | PHP staff table |

---

### 5.5 Authentication & Authorization

| Component | Resolution |
|---------|------------|
| JWT generation | PHP |
| JWT validation | PHP |
| Role enforcement | PHP |
| Express auth | ❌ Not used |

---

### 5.6 File Uploads

| Aspect | Resolution |
|------|------------|
| Upload handling | PHP |
| Upload directory | `/public/uploads/` |
| Public URLs | `/uploads/[category]/file.webp` |
| Express uploads | ❌ Disabled |

---

## 6. Decommissioning Strategy (Non-Destructive)

This document does NOT mandate deletion, but defines **logical deprecation**:

| Component | Status |
|---------|--------|
| `server/index.js` | Archived |
| Express `/api/*` routes | Disabled |
| JSON persistence | Read-only / import-only |
| `src/data/*.json` | Migration artifacts |
| Express reCAPTCHA | Deprecated |

---

## 7. Benefits of This Decision

### Technical Benefits
- Single source of truth
- Predictable runtime behavior
- No hidden desynchronization
- Simplified deployment
- Lower cognitive load

### Operational Benefits
- Easier maintenance
- Easier onboarding
- Safer updates
- Compatible with hosting constraints

### Risk Reduction
- Eliminates silent failures
- Removes ambiguous routing
- Prevents data divergence
- Reduces audit & liability exposure

---

## 8. Risks & Trade-offs (Accepted)

| Risk | Acceptance |
|----|------------|
| Node.js code becomes unused | Accepted |
| JSON-based performance benefits lost | Accepted |
| Requires cleanup effort | Accepted |
| No SSR / advanced Node features | Accepted |

These risks are **less severe** than continued hybrid ambiguity.

---

## 9. Final Verdict

**This system must choose clarity over flexibility.**

Retaining PHP as the sole backend:
- Aligns with current implementation reality
- Minimizes breakage
- Maximizes stability
- Makes the system understandable and maintainable

**This is the least risky and most defensible path forward.**

---

## 10. Document Status

- Status: **Approved Architectural Decision**
- Confidence: **High**
- Based on: Static code evidence
- Intended Audience:
  - Developers
  - Technical Auditors
  - Project Owners
  - Deployment Engineers

---

## Related Documentation

- [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) - Complete system archive
- [VALIDATION_REPORT.md](VALIDATION_REPORT.md) - Conflict identification and evidence
