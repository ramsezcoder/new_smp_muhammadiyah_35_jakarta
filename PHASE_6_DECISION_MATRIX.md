# PHASE 6 — ULTRA SMART SYSTEM EVOLUTION: DECISION MATRIX

**Date**: January 9, 2026  
**Engineer**: Principal Security Architect & System Evolution Engineer  
**Phase**: Ultra Smart System Evolution (Phase 6)  
**Status**: 🎯 DECISION MATRIX COMPLETE

---

## EXECUTIVE SUMMARY

This decision matrix evaluates **critical architectural and security decisions** for the SMP Muhammadiyah 35 Jakarta system. Each decision includes:
- **Problem Statement**: Clear definition of the issue
- **Options Analysis**: Multiple approaches with pros/cons
- **Risk Assessment**: Quantified risk for each option
- **Final Recommendation**: Evidence-based decision with implementation guidance

---

## DECISION 1: JWT Token Revocation Strategy

### Problem Statement

**Current State**: JWT tokens validated by signature and expiration only, NO server-side validation against sessions table  
**Risk**: Leaked tokens remain valid for 6 hours, logout does NOT revoke tokens  
**Impact**: Stolen admin token gives attacker 6 hours of unrestricted access  

### Options

#### Option A: Continue with JWT-Only (No Server-Side State)

**Approach**: Keep current implementation, rely on short expiration times

**Pros**:
- ✅ Simple, no database queries per request
- ✅ Stateless, scales horizontally
- ✅ No additional infrastructure

**Cons**:
- ❌ No revocation capability
- ❌ Logout is client-side only
- ❌ Compromised tokens cannot be blocked
- ❌ No audit trail of active sessions

**Risk Assessment**:
- **Likelihood of token theft**: 🟡 MEDIUM (XSS, network intercept, malware)
- **Impact if stolen**: 🔴 CRITICAL (6 hours of admin access)
- **Mitigation**: Reduce TTL to 1 hour (partial mitigation, doesn't solve core issue)

**Cost**: $0 (no changes)

---

#### Option B: Server-Side Session Validation (Recommended)

**Approach**: Check sessions table during `get_auth_user()`, enable logout revocation

**Pros**:
- ✅ Full revocation capability (logout invalidates token immediately)
- ✅ "Logout all devices" functionality possible
- ✅ Audit trail of active sessions
- ✅ Backward-compatible (existing tokens still work initially)
- ✅ Fail-closed security (reject if session check fails)

**Cons**:
- ⚠️ One additional database query per authenticated request
- ⚠️ Sessions table cleanup required (cron job)
- ⚠️ Stateful (less scalable, but acceptable for school website traffic)

**Risk Assessment**:
- **Performance impact**: 🟢 LOW (1 SELECT query, indexed on `session_token`)
- **Database load**: 🟢 LOW (~100-500 auth requests/day for school website)
- **Implementation risk**: 🟢 LOW (well-defined pattern, 1-2 days work)

**Cost**: 1-2 days development + testing

**Implementation Snippet**:
```php
// In get_auth_user()
$stmt = $pdo->prepare('SELECT id FROM sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1');
$stmt->execute([$token]);
if (!$stmt->fetch()) {
  respond(false, 'Session invalid or revoked', [], 401);
}
```

---

#### Option C: Token Blacklist (Alternative)

**Approach**: Create `blacklisted_tokens` table, check on each request

**Pros**:
- ✅ Revocation capability
- ✅ Logout works
- ✅ No session tracking needed

**Cons**:
- ❌ Blacklist grows indefinitely (must expire entries after token TTL)
- ❌ More complex cleanup logic
- ❌ No audit trail of active sessions
- ❌ No "logout all devices" (requires session tracking anyway)

**Risk Assessment**:
- **Complexity**: 🟡 MODERATE (blacklist expiration logic)
- **Storage**: 🟡 MODERATE (blacklist grows, needs pruning)

**Cost**: 2-3 days development + testing

---

### Final Recommendation

**✅ OPTION B: Server-Side Session Validation**

**Rationale**:
1. **Security**: Full revocation capability eliminates 6-hour attack window
2. **Auditability**: Sessions table provides login history and active session tracking
3. **User Experience**: "Logout all devices" feature improves account security
4. **Performance**: Acceptable overhead for school website traffic (~1ms per request)
5. **Backward Compatibility**: Existing architecture already has sessions table (login.php inserts rows)

**Implementation Priority**: 🔴 CRITICAL (Week 1-2)

**Migration Path**:
1. Deploy code changes (add session check to `get_auth_user()`)
2. All new logins create sessions (already happening)
3. Old tokens without session entry rejected (grace period: 6 hours until all old tokens expire)
4. Monitor for any authentication issues
5. Add cron job to cleanup expired sessions: `DELETE FROM sessions WHERE expires_at < NOW()`

---

## DECISION 2: Dual Backend Architecture Resolution

### Problem Statement

**Current State**: Two backends (Node.js Express + PHP) with overlapping endpoints  
**Risk**: Data desynchronization, maintenance burden, routing confusion  
**Impact**: Admin edits not visible on public site, deployment complexity  

### Options

#### Option A: Keep Both Backends (Status Quo)

**Approach**: Continue with Node.js serving frontend + public APIs, PHP handling admin + database

**Pros**:
- ✅ No migration work required
- ✅ Node.js handles image processing (Sharp library)

**Cons**:
- ❌ Data desynchronization (admin DB vs public JSON)
- ❌ Dual deployment (2 servers, 2 processes)
- ❌ Routing complexity (must proxy correctly)
- ❌ No authentication on Node.js endpoints
- ❌ Double maintenance burden
- ❌ Confusing for future developers

**Risk Assessment**:
- **Data consistency**: 🔴 HIGH (admin changes invisible to public)
- **Maintenance burden**: 🔴 HIGH (two codebases to update)
- **Deployment failure**: 🟠 MODERATE (more moving parts)

**Cost**: $0 upfront, **high ongoing cost** (maintenance)

---

#### Option B: Migrate to PHP-Only Backend (Recommended)

**Approach**: Remove Node.js backend, serve frontend via Apache/Nginx, PHP handles all APIs

**Pros**:
- ✅ Single source of truth (MySQL database)
- ✅ Unified authentication (all endpoints protected)
- ✅ Simplified deployment (one backend)
- ✅ Lower maintenance burden
- ✅ Eliminates data desynchronization
- ✅ PHP already production-hardened (Phase 5)

**Cons**:
- ⚠️ Requires frontend updates (API endpoint URLs)
- ⚠️ Lose Node.js image processing (can use PHP alternatives: GD, Imagick)
- ⚠️ Migration work required (1-2 weeks)

**Risk Assessment**:
- **Breaking changes**: 🟡 MODERATE (frontend API calls need updating)
- **Rollback complexity**: 🟡 MODERATE (can run both backends in parallel during migration)
- **Implementation risk**: 🟢 LOW (well-defined migration path)

**Cost**: 1-2 weeks development + testing

**Migration Path**:
1. **Week 1**: Audit frontend API calls, identify all Node.js endpoint dependencies
2. **Week 2**: Update frontend to call PHP endpoints (`/api/articles/list.php` instead of `/api/news/list`)
3. **Week 3**: Deploy frontend changes, test all pages (news, gallery, staff, videos)
4. **Week 4**: Remove Node.js from production, serve frontend via Apache/Nginx
5. **Week 5**: Monitor, mark `server/` directory as deprecated

---

#### Option C: Migrate to Node.js-Only Backend (NOT Recommended)

**Approach**: Port all PHP endpoints to Node.js, remove PHP backend

**Pros**:
- ✅ Modern JavaScript stack (Node.js + React)
- ✅ Unified language (JavaScript everywhere)

**Cons**:
- ❌ Requires rewriting ALL PHP endpoints (~50 files)
- ❌ Lose Phase 1-5 work (authentication, CRUD, security hardening)
- ❌ Node.js lacks PHP's mature database ecosystem (PDO)
- ❌ Must reimplement JWT generation, file upload validation, atomic transactions
- ❌ **Violates Phase 6 constraint: "NO refactoring, NO redesigning"**
- ❌ Extremely high effort (1-2 months)

**Risk Assessment**:
- **Regression risk**: 🔴 CRITICAL (rewriting battle-tested code)
- **Implementation risk**: 🔴 HIGH (complex, error-prone)
- **Timeline risk**: 🔴 HIGH (delays other critical fixes)

**Cost**: 1-2 months development + extensive testing

**Verdict**: ❌ **REJECTED** (violates Phase 6 principles, too risky)

---

### Final Recommendation

**✅ OPTION B: Migrate to PHP-Only Backend**

**Rationale**:
1. **Data Integrity**: Single source of truth eliminates desynchronization
2. **Security**: Unified authentication, all endpoints protected
3. **Maintainability**: One backend, one deployment, lower complexity
4. **Leverage Existing Work**: PHP backend already production-hardened (Phase 1-5)
5. **Cost-Effective**: 1-2 weeks vs. 1-2 months for Option C

**Implementation Priority**: 🔴 CRITICAL (Week 3-4, after C1-C3)

**Alternative Considered**: Hybrid approach (PHP for admin, Node.js for public)
- **Rejected**: Still has dual backend complexity, doesn't solve data desynchronization

**Frontend Changes Required**:
- `src/pages/news/NewsListPage.jsx`: Change `/api/news/list` → `/api/articles/list.php`
- Verify no other components call Node.js endpoints
- Test all public pages after migration

---

## DECISION 3: Author Ownership Enforcement Strategy

### Problem Statement

**Current State**: Author role can modify/delete ANY article in system  
**Risk**: Privilege escalation, data integrity violation  
**Impact**: Malicious Author can delete all articles or modify competitor content  

### Options

#### Option A: Add Ownership Check (Strict Enforcement)

**Approach**: Check `author_id == $user['sub']` for Author role on update/delete

**Pros**:
- ✅ Secure by default (Author cannot escalate privileges)
- ✅ Simple logic (one additional WHERE clause)
- ✅ Backward-compatible (Admin/Superadmin unchanged)
- ✅ Aligns with role expectations

**Cons**:
- ⚠️ Author locked to own articles (may need Admin to transfer ownership)

**Risk Assessment**:
- **False positives**: 🟢 NONE (ownership is clear)
- **Usability impact**: 🟡 LOW (Authors should only edit own content)
- **Implementation risk**: 🟢 TRIVIAL (5 lines of code)

**Cost**: 30 minutes development + testing

**Implementation Snippet**:
```php
if ($user['role'] === 'Author') {
  $stmt = $pdo->prepare('SELECT author_id FROM articles WHERE id = ?');
  $stmt->execute([$id]);
  $article = $stmt->fetch();
  
  if ((int)$article['author_id'] !== (int)$user['sub']) {
    respond(false, 'You can only edit your own articles', [], 403);
  }
}
```

---

#### Option B: Advisory Warning (Soft Enforcement)

**Approach**: Log warning but allow modification (audit trail only)

**Pros**:
- ✅ Flexible (Author can edit any article if needed)
- ✅ Audit trail (logs show who edited what)

**Cons**:
- ❌ Does NOT prevent privilege escalation
- ❌ Security theater (warning ignored by malicious user)
- ❌ Violates principle of least privilege

**Risk Assessment**:
- **Security impact**: 🔴 CRITICAL (no actual protection)
- **Auditability**: 🟡 MODERATE (logs help, but damage already done)

**Cost**: 30 minutes (same as Option A, but less secure)

**Verdict**: ❌ **REJECTED** (insufficient security)

---

#### Option C: Role-Based UI Restrictions (Frontend Only)

**Approach**: Hide edit/delete buttons for non-owned articles in admin dashboard

**Pros**:
- ✅ Better UX (Author doesn't see irrelevant controls)

**Cons**:
- ❌ Client-side only (trivial to bypass)
- ❌ API endpoints still unprotected
- ❌ False sense of security

**Risk Assessment**:
- **Security impact**: 🔴 CRITICAL (no backend enforcement)
- **Bypassa bility**: 🔴 TRIVIAL (Postman, curl, browser console)

**Cost**: 1 day frontend work

**Verdict**: ❌ **REJECTED** (client-side security is not security)

---

### Final Recommendation

**✅ OPTION A: Add Ownership Check (Strict Enforcement)**

**Rationale**:
1. **Security First**: Backend enforcement cannot be bypassed
2. **Principle of Least Privilege**: Author should only edit own content
3. **Trivial Implementation**: 5 lines of code, 30 minutes work
4. **Backward Compatible**: Admin/Superadmin behavior unchanged
5. **Audit Trail**: Rejected attempts logged via `error_log()`

**Implementation Priority**: 🔴 CRITICAL (Week 1, can deploy with C1)

**Edge Cases Handled**:
- **Transfer Ownership**: Admin can manually update `author_id` in database if needed
- **Bulk Operations**: Admin/Superadmin can modify any article (unchanged)
- **Article Without Author**: If `author_id` is NULL, only Admin/Superadmin can edit

**Frontend Enhancement** (optional, after backend fix):
- Hide edit/delete buttons for non-owned articles in Author's dashboard
- NOT a substitute for backend enforcement, just better UX

---

## DECISION 4: Frontend Error Handling Strategy

### Problem Statement

**Current State**: API errors caught but NOT displayed, leading to blank UI sections  
**Risk**: Poor user experience, difficult debugging in production  
**Impact**: Users see blank gallery/news without explanation, support burden increases  

### Options

#### Option A: Global Error Handler with Toast Notifications (Recommended)

**Approach**: Create `errorHandler.js` utility, display toast for all API errors, handle 401 redirects

**Pros**:
- ✅ Consistent error handling across all components
- ✅ Visible feedback (toast notifications)
- ✅ Automatic redirect on 401 (token expiration)
- ✅ Reusable utility (DRY principle)
- ✅ Non-intrusive (toast appears, doesn't block UI)

**Cons**:
- ⚠️ Requires updating all data-fetching components
- ⚠️ Toast library already in use (`useToast` hook exists)

**Risk Assessment**:
- **Implementation risk**: 🟢 LOW (straightforward utility function)
- **UX impact**: 🟢 POSITIVE (users see errors instead of blank screens)
- **Breaking changes**: 🟢 NONE (additive only)

**Cost**: 1-2 days for all components

**Implementation Snippet**:
```javascript
export function handleApiError(error, navigate, toast) {
  if (error?.status === 401) {
    localStorage.removeItem('app_session');
    toast({ title: 'Session Expired', description: 'Please log in again', variant: 'destructive' });
    navigate('/admin/login');
  } else if (error?.status === 403) {
    toast({ title: 'Access Denied', description: error.message, variant: 'destructive' });
  } else {
    toast({ title: 'Error', description: error.message || 'Request failed', variant: 'destructive' });
  }
}
```

---

#### Option B: Inline Error Messages (Component-Level)

**Approach**: Each component renders error state in JSX (e.g., red banner above content)

**Pros**:
- ✅ Error visible in context (e.g., "Gallery failed to load" above gallery section)
- ✅ No toast library dependency

**Cons**:
- ❌ Inconsistent styling (each component implements differently)
- ❌ More code duplication
- ❌ No automatic 401 redirect handling
- ❌ Clutters component JSX

**Risk Assessment**:
- **Maintainability**: 🟡 MODERATE (duplicate error UI logic)
- **Consistency**: 🟡 MODERATE (may look different across pages)

**Cost**: 1-2 days (same as Option A, but less maintainable)

---

#### Option C: Silent Failures with Console Logging (Status Quo)

**Approach**: Keep current behavior (catch error, log to console, show blank section)

**Pros**:
- ✅ No work required

**Cons**:
- ❌ Poor user experience (users confused by blank sections)
- ❌ Difficult debugging (must check browser console)
- ❌ Support burden (users report "gallery not working" without details)

**Risk Assessment**:
- **User satisfaction**: 🔴 LOW (frustrating experience)
- **Support burden**: 🟠 HIGH (users don't know what's wrong)

**Cost**: $0 development, **high ongoing support cost**

**Verdict**: ❌ **REJECTED** (unacceptable UX)

---

### Final Recommendation

**✅ OPTION A: Global Error Handler with Toast Notifications**

**Rationale**:
1. **Consistent UX**: All errors displayed uniformly
2. **Automatic Auth Handling**: 401 errors redirect to login
3. **Reusable**: One utility function for all components
4. **Non-Intrusive**: Toast appears temporarily, doesn't block UI
5. **Already Available**: `useToast` hook exists in codebase

**Implementation Priority**: 🟠 HIGH (Week 5-6, after critical security fixes)

**Components to Update**:
- `GallerySection.jsx`
- `NewsSection.jsx` (if exists)
- `StaffSection.jsx` (if exists)
- Admin dashboard data-fetching components

**Error Categorization**:
- **401 Unauthorized**: Clear session, redirect to login, toast "Session expired"
- **403 Forbidden**: Toast "Access denied: [message]"
- **500 Server Error**: Toast "Server error, try again later"
- **Network Error**: Toast "Network error, check connection"

---

## DECISION 5: Rollback Strategy & Orphan File Management

### Problem Statement

**Current State**: No documented rollback procedure, database rollback leaves orphaned upload files  
**Risk**: Risky deployments, storage bloat from orphaned files  
**Impact**: Failed deployments hard to recover, orphaned files accumulate over time  

### Options

#### Option A: Document Rollback SOP + Create Orphan Cleanup Tool (Recommended)

**Approach**: Write `ROLLBACK_SOP.md`, enhance existing `orphan-files.php` script

**Pros**:
- ✅ Clear rollback procedure (code + DB + uploads)
- ✅ Orphan detection and cleanup automated
- ✅ Leverages existing tool (`public/api/admin/orphan-files.php`)
- ✅ No architectural changes

**Cons**:
- ⚠️ Requires running cleanup script manually after rollback

**Risk Assessment**:
- **Deployment confidence**: 🟢 HIGH (clear rollback path)
- **Storage bloat**: 🟢 MITIGATED (cleanup tool available)
- **Operational complexity**: 🟢 LOW (well-documented procedure)

**Cost**: 1 day documentation + testing

**ROLLBACK_SOP.md Outline**:
```markdown
1. Pre-Rollback: Backup database + upload directories
2. Code Rollback: git checkout <previous-tag>
3. Database Rollback: mysql < backup.sql
4. Upload Rollback: Restore from tar.gz backup
5. Orphan Cleanup: php orphan-files.php --scan --delete
6. Verification: Test health endpoint, admin login, frontend
```

---

#### Option B: Migration-Based Approach (Forward-Only)

**Approach**: Use database migrations (e.g., Phinx), never rollback, only migrate forward

**Pros**:
- ✅ No rollback needed (fix forward with new migration)
- ✅ Version-controlled schema changes

**Cons**:
- ❌ Requires migration tool integration
- ❌ Doesn't solve orphan file issue
- ❌ High architectural change
- ❌ Emergency rollback still needed for critical bugs

**Risk Assessment**:
- **Complexity**: 🔴 HIGH (new tooling, workflow changes)
- **Timeline**: 🔴 LONG (weeks to implement)

**Cost**: 1-2 weeks development + team training

**Verdict**: ❌ **REJECTED** (too complex for current needs)

---

#### Option C: Automated Backup + Rollback Script

**Approach**: Create automated backup script (runs before deployment), rollback script (one command)

**Pros**:
- ✅ Fully automated (one command to backup, one to rollback)
- ✅ Reduces human error

**Cons**:
- ⚠️ Requires infrastructure setup (cron jobs, backup storage)
- ⚠️ Doesn't eliminate orphan files (still need cleanup)

**Risk Assessment**:
- **Complexity**: 🟡 MODERATE (scripting + infrastructure)
- **Reliability**: 🟡 MODERATE (depends on automation working correctly)

**Cost**: 3-5 days development + testing

**Verdict**: 🟡 **CONSIDER FOR FUTURE** (after manual SOP proven)

---

### Final Recommendation

**✅ OPTION A: Document Rollback SOP + Create Orphan Cleanup Tool**

**Rationale**:
1. **Pragmatic**: Solves immediate need (clear rollback procedure)
2. **Low Risk**: Documentation + existing tool enhancement
3. **Quick Win**: 1 day work, immediate operational benefit
4. **Foundation**: Can automate later (Option C) if needed

**Implementation Priority**: 🟠 HIGH (Week 7-8, after security fixes)

**Orphan File Detection Logic**:
```php
// Scan /public/uploads/gallery/
// Query: SELECT filename FROM gallery_images
// Diff: Files on disk NOT in database = orphans
// Output: List for review
// Action (--delete flag): Delete orphaned files
```

**Rollback Testing**:
- Test rollback on staging environment
- Verify database restore works
- Verify upload restore works
- Verify orphan cleanup detects and removes test files

---

## DECISION SUMMARY TABLE

| Decision | Problem | Recommended Option | Priority | Effort | Timeline |
|----------|---------|-------------------|----------|--------|----------|
| **D1: JWT Revocation** | Tokens cannot be revoked | Server-side session validation | 🔴 CRITICAL | MODERATE | Week 1-2 |
| **D2: Dual Backend** | Data desynchronization | Migrate to PHP-only | 🔴 CRITICAL | HIGH | Week 3-4 |
| **D3: Author Ownership** | Privilege escalation | Strict ownership check | 🔴 CRITICAL | TRIVIAL | Week 1 |
| **D4: Error Handling** | Silent failures, poor UX | Global error handler + toasts | 🟠 HIGH | MODERATE | Week 5-6 |
| **D5: Rollback Strategy** | Risky deployments, orphans | Document SOP + cleanup tool | 🟠 HIGH | LOW | Week 7-8 |

---

## IMPLEMENTATION DEPENDENCIES

**Critical Path**:
1. **D3** (Author ownership) → Can deploy immediately (no dependencies)
2. **D1** (JWT revocation) → Requires D3 complete (clean authentication state)
3. **D2** (Dual backend) → Requires D1 complete (stable backend before migration)
4. **D4** (Error handling) → Can develop in parallel with D1-D3
5. **D5** (Rollback SOP) → Can document anytime, test after D1-D3 deployed

**Parallelization Possible**:
- D3 + D4 (independent work streams)
- D1 development while D3 deployed
- D5 documentation while D1-D3 in progress

---

## RISK MITIGATION SUMMARY

| Decision | Primary Risk | Mitigation Strategy |
|----------|--------------|---------------------|
| D1 | Performance impact from session check | Index `session_token` column, cache queries |
| D2 | Frontend breaking changes | Parallel deployment (Node.js + PHP running together during migration) |
| D3 | Author locked out of own articles | Admin can transfer ownership if needed |
| D4 | Too many toast notifications | Debounce errors, group similar errors |
| D5 | Incomplete rollback | Pre-rollback checklist, verification steps |

---

## ALTERNATIVE APPROACHES REJECTED

| Approach | Decision Area | Reason for Rejection |
|----------|---------------|----------------------|
| JWT blacklist | D1 (Revocation) | More complex than session validation, no audit trail |
| Keep both backends | D2 (Architecture) | Perpetuates data desynchronization, high maintenance burden |
| Node.js-only backend | D2 (Architecture) | Violates Phase 6 constraints, discards Phase 1-5 work |
| Advisory warning (Author) | D3 (Ownership) | Security theater, doesn't prevent privilege escalation |
| Frontend-only restrictions | D3 (Ownership) | Client-side security is not security |
| Inline error messages | D4 (Error handling) | Inconsistent, duplicate code, harder to maintain |
| Silent failures | D4 (Error handling) | Unacceptable UX, high support burden |
| Migration-based rollback | D5 (Rollback) | Too complex, doesn't solve immediate need |

---

## FINAL DECISION AUTHORITY

**Decisions Requiring Client Approval**:
- ✅ D1: JWT revocation (security architecture change)
- ✅ D2: Dual backend resolution (infrastructure change, frontend updates)

**Decisions Requiring Technical Lead Approval**:
- ✅ D4: Error handling (UX change)
- ✅ D5: Rollback SOP (operational procedure)

**Internal Technical Decisions** (No external approval):
- ✅ D3: Author ownership (security bug fix)

---

**Decision Matrix Completed By**: Principal Security Architect & System Evolution Engineer  
**Date**: January 9, 2026  
**Phase**: 6 (System Evolution & Maturity)  
**Total Decisions**: 5 (3 Critical, 2 High)

**END OF PHASE 6 DECISION MATRIX**
