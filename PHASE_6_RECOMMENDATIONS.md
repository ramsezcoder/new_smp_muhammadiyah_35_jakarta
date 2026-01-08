# PHASE 6 — ULTRA SMART SYSTEM EVOLUTION: RECOMMENDATIONS

**Date**: January 9, 2026  
**Engineer**: Principal Security Architect & System Evolution Engineer  
**Phase**: Ultra Smart System Evolution (Phase 6)  
**Status**: 📋 RECOMMENDATIONS COMPLETE

---

## EXECUTIVE SUMMARY

This document prioritizes 11 findings from PHASE_6_ANALYSIS.md into actionable recommendations. Each recommendation includes:
- **Priority Level**: Critical / High / Medium / Optional
- **What to do now**: Immediate actions required
- **What to delay**: Can be addressed in future maintenance
- **What NOT to touch**: Areas to avoid (backward compatibility)
- **Backward-compatible migration strategy** (where applicable)

---

## PRIORITY CLASSIFICATION

### 🔴 CRITICAL (Fix Immediately — Days, Not Weeks)

**Timeline**: Within 1-2 weeks  
**Risk if delayed**: Security incidents, data loss, system instability  
**Approval Required**: YES (involves security and data integrity)

---

### 🟠 HIGH (Fix Soon — Weeks, Not Months)

**Timeline**: Within 4-6 weeks  
**Risk if delayed**: Poor user experience, operational issues, technical debt accumulation  
**Approval Required**: YES (involves UX and operational changes)

---

### 🟡 MEDIUM (Plan to Fix — Months)

**Timeline**: Within 3-6 months  
**Risk if delayed**: Increased maintenance burden, minor inconvenience  
**Approval Required**: OPTIONAL (nice-to-have improvements)

---

### 🔵 OPTIONAL (Consider for Future)

**Timeline**: After 6 months or never  
**Risk if delayed**: Minimal to none  
**Approval Required**: NO (internal refactoring)

---

## CRITICAL RECOMMENDATIONS

### C1. Enable JWT Server-Side Revocation (Sessions Table Validation)

**Finding Reference**: PHASE_6_ANALYSIS.md Section 1.1.1, 1.1.2

**Priority**: 🔴 CRITICAL

**Problem**:
- JWT tokens cannot be revoked before 6-hour expiration
- Logout does NOT invalidate tokens server-side
- Leaked tokens remain valid for entire TTL
- Attacker has 6 hours of full access if token stolen

**What to Do Now**:

1. **Modify `get_auth_user()` to check sessions table**:
   - Add database query after JWT signature validation
   - Check if token exists in `sessions` table with `expires_at > NOW()`
   - Reject token if NOT found in sessions table

2. **Implement logout token revocation**:
   - Modify `auth/logout.php` to DELETE row from `sessions` table matching token
   - Add "logout all devices" endpoint: DELETE all sessions for `user_id`

3. **Add session cleanup cron job**:
   - Periodic task to delete expired sessions (`WHERE expires_at < NOW()`)
   - Prevents sessions table bloat

**Implementation (Backward-Compatible)**:

**File**: `public/api/_bootstrap.php`  
**Function**: `get_auth_user()`  
**Change**:
```php
function get_auth_user(array $config) {
  global $pdo; // Access global PDO connection
  
  // ... existing JWT validation (signature, expiration) ...
  
  // NEW: Check sessions table (server-side revocation)
  try {
    $stmt = $pdo->prepare('
      SELECT id FROM sessions 
      WHERE session_token = ? 
      AND expires_at > NOW() 
      LIMIT 1
    ');
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    
    if (!$session) {
      // Token not found or expired in sessions table
      respond(false, 'Session invalid or revoked', [], 401);
    }
  } catch (Throwable $e) {
    error_log('SESSION CHECK FAILED: ' . $e->getMessage());
    // Fail-closed: Reject token if session check fails
    respond(false, 'Session validation error', [], 500);
  }
  
  return $payload;
}
```

**File**: `public/api/auth/logout.php`  
**Change**:
```php
// Extract token before validation (for deletion)
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
  respond(false, 'Missing token', [], 401);
}
$token = $m[1];

$user = require_auth($config);

// NEW: Revoke session from database
try {
  $stmt = $pdo->prepare('DELETE FROM sessions WHERE session_token = ?');
  $stmt->execute([$token]);
  error_log('LOGOUT: session revoked for user_id=' . $user['sub']);
} catch (Throwable $e) {
  error_log('LOGOUT: session revoke failed: ' . $e->getMessage());
  // Continue with logout even if DB fails
}

respond(true, 'Logged out successfully', []);
```

**Migration Strategy**:
1. Deploy code changes (sessions table check in `get_auth_user()`)
2. All existing tokens in sessions table remain valid (no breaking change)
3. New logins create sessions as before
4. Logout now revokes sessions (new behavior, backward-compatible)
5. Old sessions without DB entry will be rejected (force re-login for old tokens)

**Risk**: 🟡 LOW
- Existing valid tokens may be rejected if session not in DB (edge case for very old tokens)
- Mitigation: Grace period (deploy on Friday, monitor over weekend, notify users)

**Effort**: 🟡 MODERATE (1-2 days development + testing)

---

### C2. Add Author Ownership Enforcement (Articles)

**Finding Reference**: PHASE_6_ANALYSIS.md Section 1.2.1

**Priority**: 🔴 CRITICAL

**Problem**:
- Author can modify/delete ANY article in system
- No check comparing `author_id` with JWT `sub` (user ID)
- Privilege escalation risk

**What to Do Now**:

1. **Modify articles/update.php**:
   - After authenticating Author, check if `$user['sub'] == article.author_id`
   - Allow Admin/Superadmin to bypass ownership check
   - Reject Author if not owner with 403 Forbidden

2. **Modify articles/delete.php**:
   - Same ownership check as update

3. **Keep articles/create.php unchanged**:
   - Author sets `author_id` to `$user['sub']` (correct behavior)

**Implementation (Backward-Compatible)**:

**File**: `public/api/articles/update.php`  
**After line 10** (`$user = require_auth(...)`):
```php
$user = require_auth($config, ['Admin','Author','Superadmin']);

// NEW: Ownership enforcement for Author role
if ($user['role'] === 'Author') {
  $stmt = $pdo->prepare('SELECT author_id FROM articles WHERE id = ?');
  $stmt->execute([$id]);
  $article = $stmt->fetch();
  
  if (!$article) {
    respond(false, 'Article not found', [], 404);
  }
  
  if ((int)$article['author_id'] !== (int)$user['sub']) {
    error_log('OWNERSHIP DENIED: user_id=' . $user['sub'] . ' attempted to update article_id=' . $id . ' owned by user_id=' . $article['author_id']);
    respond(false, 'You can only edit your own articles', [], 403);
  }
}

// Continue with existing update logic...
```

**File**: `public/api/articles/delete.php`  
**After line 10** (`require_auth(...)`):
```php
$user = require_auth($config, ['Admin','Author','Superadmin']);

// NEW: Ownership enforcement for Author role
if ($user['role'] === 'Author') {
  $stmt = $pdo->prepare('SELECT author_id FROM articles WHERE id = ?');
  $stmt->execute([$id]);
  $article = $stmt->fetch();
  
  if (!$article) {
    respond(false, 'Article not found', [], 404);
  }
  
  if ((int)$article['author_id'] !== (int)$user['sub']) {
    error_log('OWNERSHIP DENIED: user_id=' . $user['sub'] . ' attempted to delete article_id=' . $id . ' owned by user_id=' . $article['author_id']);
    respond(false, 'You can only delete your own articles', [], 403);
  }
}

// Continue with existing delete logic...
```

**Migration Strategy**:
1. Deploy code changes (ownership checks)
2. **Test with Author account**:
   - Author can edit own articles ✅
   - Author CANNOT edit other authors' articles ❌ (returns 403)
3. Admin/Superadmin can edit ANY article ✅ (unchanged behavior)
4. **No database changes required** (author_id column already exists)

**Risk**: 🟢 NONE
- Existing functionality unchanged for Admin/Superadmin
- Author role gains security (not loses functionality)
- Fully backward-compatible

**Effort**: 🟢 LOW (30 minutes development + testing)

---

### C3. Add Authentication to Gallery Delete Endpoint

**Finding Reference**: PHASE_6_ANALYSIS.md Section 1.2.2

**Priority**: 🔴 CRITICAL

**Problem**:
- `/api/gallery/delete.php` has NO authentication
- Anyone can delete gallery images by sending POST with `id`
- Data loss risk

**What to Do Now**:

**File**: `public/api/gallery/delete.php`  
**After line 6** (after method check, before input parsing):
```php
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed', [], 405);
}

// NEW: Require Admin/Superadmin authentication
require_auth($config, ['Admin', 'Superadmin']);

$input = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
// ... rest of existing code ...
```

**Migration Strategy**:
1. Deploy code changes (add authentication)
2. **Breaking change**: Unauthenticated requests now return 401
3. **Frontend unchanged**: Admin dashboard already sends JWT token
4. **Public users blocked**: Can no longer delete gallery images (CORRECT behavior)

**Risk**: 🟢 NONE
- This is a **security fix**, not a feature change
- Correct behavior: Only authenticated admins should delete gallery

**Effort**: 🟢 TRIVIAL (5 minutes)

---

### C4. Resolve Dual Backend Architecture (Migrate to PHP-Only)

**Finding Reference**: PHASE_6_ANALYSIS.md Section 4.1-4.3

**Priority**: 🔴 CRITICAL

**Problem**:
- Two backends (Node.js Express + PHP) with overlapping endpoints
- Data desynchronization (admin edits DB, public reads JSON)
- Deployment complexity, maintenance burden
- News articles have dual data sources

**What to Do Now**:

**Phase 1: Audit Frontend API Calls**
1. Search all `src/` files for `/api/news/list` calls
2. Identify if any component calls Node.js backend directly
3. Document all endpoints used by frontend

**Phase 2: Migrate News to PHP Backend**
1. Verify `/api/articles/list.php` (PHP) has all required fields for public display
2. Update frontend to call `/api/articles/list.php` instead of `/api/news/list`
3. Test public news display with PHP backend

**Phase 3: Serve Frontend from PHP/Apache**
1. Configure Apache to serve `/dist/` directory
2. Remove Node.js Express from deployment
3. Update deployment scripts to remove `npm start` for server

**Phase 4: Clean Up**
1. **DO NOT DELETE** `server/` directory (keep for reference)
2. Mark `server/index.js` as deprecated in README
3. Update deployment documentation

**Implementation Strategy**:

**File**: `src/pages/news/NewsListPage.jsx`  
**Find**: `fetch('/api/news/list?category=...')`  
**Replace**: `fetch('/api/articles/list.php?page=...&limit=...&status=published')`

**Frontend Change**:
```jsx
// OLD (Node.js backend)
const res = await fetch(`/api/news/list?category=${activeTab}&page=${page}&limit=9`, {
  credentials: 'include'
});

// NEW (PHP backend)
const res = await fetch(`/api/articles/list.php?page=${page}&limit=9&status=published&category=${activeTab}`, {
  credentials: 'include'
});
```

**Deployment Configuration** (Apache):
```apache
# Serve frontend static files
<Directory /var/www/html/smpmuh35/dist>
  Options -Indexes
  AllowOverride None
  Require all granted
  
  # SPA fallback
  FallbackResource /index.html
</Directory>

# PHP API routes
<Directory /var/www/html/smpmuh35/public/api>
  Options -Indexes
  AllowOverride All
  Require all granted
</Directory>
```

**Migration Strategy**:
1. **Week 1**: Audit frontend API calls, document dependencies
2. **Week 2**: Update frontend to use PHP endpoints exclusively
3. **Week 3**: Deploy frontend changes, test thoroughly
4. **Week 4**: Remove Node.js from production deployment, monitor

**Risk**: 🟠 MODERATE
- Frontend changes required (API endpoint URLs)
- Must test all public pages (news, gallery, staff, videos)
- Rollback plan: Keep Node.js backend running temporarily (parallel deployment)

**Effort**: 🔴 HIGH (1-2 weeks development + testing + deployment)

**What NOT to Touch**:
- ❌ DO NOT modify Phase 1-5 PHP backend logic
- ❌ DO NOT add new features during migration
- ❌ DO NOT refactor database schema
- ✅ ONLY change API endpoint URLs in frontend

---

### C5. Fix News Article Dual Data Source

**Finding Reference**: PHASE_6_ANALYSIS.md Section 2.1.2

**Priority**: 🔴 CRITICAL (part of C4 — dual backend resolution)

**Problem**:
- Admin edits `articles` table (PHP backend)
- Public site reads `src/data/importedPosts.json` (Node.js backend)
- Admin changes NOT visible on public site

**What to Do Now**:

**Handled by C4** (dual backend resolution):
- Once frontend calls `/api/articles/list.php` for public news, issue resolved
- No separate action required beyond C4 implementation

**Migration Note**:
- `src/data/importedPosts.json` can remain as historical archive
- DO NOT delete (may contain WordPress import data not in database)
- Mark as deprecated in README

**Effort**: 🟢 NONE (covered by C4)

---

## HIGH PRIORITY RECOMMENDATIONS

### H1. Improve Frontend Error Handling (Visible Feedback)

**Finding Reference**: PHASE_6_ANALYSIS.md Section 2.2.1

**Priority**: 🟠 HIGH

**Problem**:
- API errors (401, 403, 500) caught but NOT displayed to user
- Silent failures lead to blank UI sections
- No automatic redirect on token expiration
- Poor user experience and hard debugging

**What to Do Now**:

1. **Create global error handler utility**:
   - Detect 401 (redirect to login)
   - Detect 403 (show "access denied" message)
   - Detect 500 (show "server error, try again" message)

2. **Update components to display error states**:
   - `GallerySection.jsx`: Render error message when `error` state set
   - Similar for NewsSection, StaffSection, etc.

3. **Add toast notifications** (already have `useToast` hook):
   - Show error toast for API failures
   - Include actionable message (e.g., "Please log in again")

**Implementation**:

**File**: `src/lib/errorHandler.js` (NEW)
```javascript
export function handleApiError(error, navigate, toast) {
  const status = error?.status;
  
  if (status === 401) {
    // Token expired or invalid
    localStorage.removeItem('app_session');
    toast({
      title: 'Session Expired',
      description: 'Please log in again',
      variant: 'destructive'
    });
    navigate('/admin/login');
    return;
  }
  
  if (status === 403) {
    toast({
      title: 'Access Denied',
      description: error.message || 'You do not have permission',
      variant: 'destructive'
    });
    return;
  }
  
  if (status >= 500) {
    toast({
      title: 'Server Error',
      description: 'Please try again later',
      variant: 'destructive'
    });
    return;
  }
  
  // Generic error
  toast({
    title: 'Error',
    description: error.message || 'Request failed',
    variant: 'destructive'
  });
}
```

**File**: `src/components/GallerySection.jsx`  
**Update** (lines 23-30):
```jsx
} catch (e) {
  if (isMounted) {
    setError(e?.message || 'Gagal memuat galeri');
    setGalleryImages([]);
    // NEW: Use error handler
    handleApiError(e, navigate, toast);
  }
}
```

**Add error UI** (in JSX return):
```jsx
{error && (
  <div className="text-center py-12">
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <p className="text-red-600 font-medium">{error}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      Muat Ulang
    </button>
  </div>
)}
```

**Migration Strategy**:
1. Create `errorHandler.js` utility
2. Update all data-fetching components (GallerySection, NewsSection, StaffSection)
3. Test error scenarios (disconnect backend, use invalid token, etc.)
4. **No breaking changes** (additive only)

**Risk**: 🟢 NONE (UX improvement only)

**Effort**: 🟡 MODERATE (1-2 days for all components)

---

### H2. Create Rollback SOP with Orphan File Cleanup Tool

**Finding Reference**: PHASE_6_ANALYSIS.md Section 3.1.1, 3.1.3

**Priority**: 🟠 HIGH

**Problem**:
- No documented rollback procedure
- Database rollback leaves orphaned upload files
- No mechanism to detect or remove orphans

**What to Do Now**:

1. **Document Rollback SOP**:
   - Create `ROLLBACK_SOP.md` with step-by-step rollback procedure
   - Include database backup/restore commands
   - Include upload directory backup commands
   - Include frontend build rollback

2. **Create Orphan File Detector**:
   - PHP script to scan `/public/uploads/` vs database records
   - List files not referenced in any table
   - Optional: Delete orphans (with confirmation)

**Implementation**:

**File**: `ROLLBACK_SOP.md` (NEW)
```markdown
# Rollback Standard Operating Procedure

## Pre-Rollback Checklist

1. Backup current database:
   ```bash
   mysqldump -u root -p smpmuh35_web > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. Backup upload directories:
   ```bash
   tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
   ```

3. Note current Git commit:
   ```bash
   git rev-parse HEAD > current_commit.txt
   ```

## Rollback Procedure

### 1. Code Rollback
```bash
git checkout <previous-tag-or-commit>
npm install
npm run build
```

### 2. Database Rollback
```bash
mysql -u root -p smpmuh35_web < backup_YYYYMMDD_HHMMSS.sql
```

### 3. Upload Files Rollback
```bash
rm -rf public/uploads/
tar -xzf uploads_backup_YYYYMMDD_HHMMSS.tar.gz
```

### 4. Orphan File Cleanup
```bash
php public/api/admin/orphan-files.php --scan
# Review output
php public/api/admin/orphan-files.php --delete
```

## Post-Rollback Verification

1. Check health endpoint: `curl /api/health.php`
2. Test admin login
3. Verify frontend loads
4. Check upload directories writable
```

**File**: `public/api/admin/orphan-files.php` (ENHANCE EXISTING)
- Current file exists (found in grep_search results earlier)
- Verify it scans gallery, staff, articles, videos uploads
- Add `--delete` flag to remove orphans (with confirmation)

**Migration Strategy**:
1. Document rollback SOP (no code changes)
2. Test orphan-files.php on staging
3. Train operations team on rollback procedure

**Risk**: 🟢 NONE (documentation + tool)

**Effort**: 🟡 MODERATE (1 day documentation + testing)

---

### H3. Integrate Health Endpoint with Frontend Monitoring

**Finding Reference**: PHASE_6_ANALYSIS.md Section 2.2.1

**Priority**: 🟠 HIGH

**Problem**:
- Health endpoint (`/api/health.php`) exists but NOT used by frontend
- No runtime monitoring or degraded state detection
- No visible feedback if backend is degraded

**What to Do Now**:

1. **Add health check on admin dashboard load**:
   - Call `/api/health.php` on admin dashboard mount
   - Display warning banner if status = "degraded" or "unhealthy"

2. **Periodic health check** (optional):
   - Check health every 5 minutes while admin dashboard open
   - Alert user if status changes

**Implementation**:

**File**: `src/components/AdminDashboard.jsx` (or main admin component)  
**Add**:
```jsx
const [systemHealth, setSystemHealth] = useState(null);

useEffect(() => {
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health.php');
      const json = await res.json();
      setSystemHealth(json.data);
      
      if (json.data.status === 'unhealthy') {
        toast({
          title: 'System Health Warning',
          description: 'Backend is experiencing issues',
          variant: 'destructive'
        });
      }
    } catch (e) {
      // Health check failed, but don't block UI
      console.error('Health check failed:', e);
    }
  };
  
  checkHealth();
  const interval = setInterval(checkHealth, 300000); // 5 minutes
  
  return () => clearInterval(interval);
}, []);
```

**Add health status banner**:
```jsx
{systemHealth?.status === 'degraded' && (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
    <strong>Warning:</strong> System is experiencing degraded performance.
  </div>
)}

{systemHealth?.status === 'unhealthy' && (
  <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
    <strong>Critical:</strong> System backend is unhealthy. Contact administrator.
  </div>
)}
```

**Migration Strategy**:
1. Add health check to admin dashboard
2. Test by breaking database connection (verify "unhealthy" banner appears)
3. **No breaking changes** (additive only)

**Risk**: 🟢 NONE (monitoring improvement)

**Effort**: 🟢 LOW (1-2 hours)

---

## MEDIUM PRIORITY RECOMMENDATIONS

### M1. Standardize API Response Structure (Node.js vs PHP)

**Finding Reference**: PHASE_6_ANALYSIS.md Section 2.2.2

**Priority**: 🟡 MEDIUM

**Problem**:
- Node.js returns `{ success, data, items, totalPages, ... }`
- PHP returns `{ success, message, data }`
- Inconsistency increases frontend complexity

**What to Do Later** (after C4 — dual backend resolution):
- Once Node.js backend removed, issue resolved
- All APIs will use PHP standard response format

**Effort**: 🟢 NONE (covered by C4)

---

### M2. Refactor _bootstrap.php (Split Concerns)

**Finding Reference**: PHASE_6_ANALYSIS.md Section 3.2.2

**Priority**: 🟡 MEDIUM

**Problem**:
- `_bootstrap.php` is 234 lines with multiple concerns
- Future additions could bloat file further

**What to Do Later** (after critical fixes):
1. Split into separate files:
   - `_config.php` — environment detection, validation
   - `_helpers.php` — slugify, unique_filename, validate_image_upload
   - `_auth.php` — get_auth_user, require_auth
   - `_bootstrap.php` — minimal loader

2. Update all endpoints to `require __DIR__ . '/../_bootstrap.php'` (no change needed)

**Migration Strategy**:
1. Create new files with extracted functions
2. Update `_bootstrap.php` to include new files
3. **No API endpoint changes required** (internal refactor only)

**Risk**: 🟢 NONE (internal refactoring)

**Effort**: 🟡 MODERATE (4-6 hours refactoring + testing)

**When to Do**: After C1-C5 complete (not urgent)

---

### M3. Add "Logout All Devices" Functionality

**Finding Reference**: PHASE_6_ANALYSIS.md Section 1.1.3

**Priority**: 🟡 MEDIUM

**Problem**:
- No way to logout from all devices simultaneously
- Compromised account requires password change

**What to Do Later**:
1. Create `/api/auth/logout-all.php` endpoint
2. Delete ALL sessions for user: `DELETE FROM sessions WHERE user_id = ?`
3. Add button in admin dashboard "Logout All Devices"

**Implementation** (after C1 — sessions table validation):

**File**: `public/api/auth/logout-all.php` (NEW)
```php
<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$user = require_auth($config);

try {
  $stmt = $pdo->prepare('DELETE FROM sessions WHERE user_id = ?');
  $stmt->execute([$user['sub']]);
  $count = $stmt->rowCount();
  
  error_log('LOGOUT ALL: user_id=' . $user['sub'] . ' revoked ' . $count . ' sessions');
  
  respond(true, 'All sessions logged out', ['count' => $count]);
} catch (Throwable $e) {
  respond(false, 'Logout failed', ['error' => $e->getMessage()], 500);
}
```

**Frontend**: Add button in admin settings page

**Risk**: 🟢 NONE (additive feature)

**Effort**: 🟢 LOW (1-2 hours)

**When to Do**: After C1 complete

---

## OPTIONAL RECOMMENDATIONS

### O1. Add Rate Limiting to API Endpoints

**Finding Reference**: PHASE_6_ANALYSIS.md Section 1.2 (implicit)

**Priority**: 🔵 OPTIONAL

**Problem**:
- No rate limiting on API endpoints
- Attacker with stolen token can automate mass operations

**What to Consider Later**:
- Add rate limiting middleware (PHP or Nginx level)
- Example: 100 requests per minute per IP
- More complex: Role-based limits (Author 50/min, Admin 200/min)

**Effort**: 🔴 HIGH (requires infrastructure changes)

**When to Do**: After 6 months, only if abuse detected

---

### O2. Add Database Migration Tool

**Finding Reference**: PHASE_6_ANALYSIS.md Section 3.1.1

**Priority**: 🔵 OPTIONAL

**Problem**:
- Schema changes not versioned
- No forward-only migration system

**What to Consider Later**:
- Add migration tool (e.g., Phinx, Laravel Migrations)
- Version control schema changes
- Enable automated database updates

**Effort**: 🔴 HIGH (architectural change)

**When to Do**: Only if frequent schema changes expected

---

## WHAT NOT TO TOUCH (LOCKED AREAS)

### ❌ DO NOT MODIFY

1. **Phase 1-5 Core Logic**:
   - Authentication flow (JWT generation, signature validation)
   - Database connection (`db_connect()`)
   - Response helpers (`respond()`, `respond_error()`)
   - File upload validation (`validate_image_upload()`)
   - Atomic DB + File operations (Phase 4 transactions)

2. **Existing API Contracts**:
   - DO NOT change response format of existing endpoints
   - DO NOT rename query parameters
   - DO NOT change HTTP methods (POST → GET)

3. **Database Schema** (unless migration planned):
   - DO NOT add/remove columns without migration
   - DO NOT change data types

### ✅ SAFE TO MODIFY

1. **Add new endpoints** (without breaking existing)
2. **Add new database checks** (sessions table validation in C1)
3. **Add new middleware** (ownership checks in C2)
4. **Frontend error handling** (additive, doesn't break existing)
5. **Documentation** (always safe)

---

## IMPLEMENTATION ROADMAP

### Week 1-2: Critical Security Fixes

- [ ] C1: Enable JWT server-side revocation (sessions table validation)
- [ ] C2: Add Author ownership enforcement
- [ ] C3: Add authentication to gallery delete endpoint

**Priority**: Security vulnerabilities  
**Risk**: High if delayed  
**Deployment**: Can be deployed incrementally

---

### Week 3-4: Dual Backend Resolution (CRITICAL)

- [ ] C4: Migrate frontend to PHP-only backend
- [ ] C5: Fix news article dual data source (covered by C4)

**Priority**: System stability and maintainability  
**Risk**: Data desynchronization persists  
**Deployment**: Requires testing and parallel deployment

---

### Week 5-6: User Experience Improvements

- [ ] H1: Improve frontend error handling
- [ ] H3: Integrate health endpoint with frontend

**Priority**: User experience  
**Risk**: Poor UX, hard debugging  
**Deployment**: Safe to deploy incrementally

---

### Week 7-8: Operational Readiness

- [ ] H2: Create rollback SOP and orphan file cleanup tool

**Priority**: Operational safety  
**Risk**: Deployment failures harder to recover  
**Deployment**: Documentation + tool (no code changes to production)

---

### Month 3-6: Maintenance Improvements (Optional)

- [ ] M1: Standardize API response structure (if C4 not complete)
- [ ] M2: Refactor _bootstrap.php (split concerns)
- [ ] M3: Add "Logout All Devices" functionality

**Priority**: Code quality, nice-to-have  
**Risk**: Minimal  
**Deployment**: After critical fixes stable

---

## EFFORT ESTIMATION SUMMARY

| Recommendation | Priority | Effort | Timeline |
|----------------|----------|--------|----------|
| C1: JWT revocation | 🔴 CRITICAL | MODERATE | 1-2 days |
| C2: Author ownership | 🔴 CRITICAL | LOW | 30 min |
| C3: Gallery delete auth | 🔴 CRITICAL | TRIVIAL | 5 min |
| C4: Dual backend resolution | 🔴 CRITICAL | HIGH | 1-2 weeks |
| C5: News dual source | 🔴 CRITICAL | NONE (covered by C4) | — |
| H1: Frontend error handling | 🟠 HIGH | MODERATE | 1-2 days |
| H2: Rollback SOP | 🟠 HIGH | MODERATE | 1 day |
| H3: Health monitoring | 🟠 HIGH | LOW | 2 hours |
| M1: API response structure | 🟡 MEDIUM | NONE (covered by C4) | — |
| M2: _bootstrap.php refactor | 🟡 MEDIUM | MODERATE | 4-6 hours |
| M3: Logout all devices | 🟡 MEDIUM | LOW | 1-2 hours |

**Total Critical Effort**: ~2-3 weeks (C1-C4)  
**Total High Effort**: ~1 week (H1-H3)  
**Total Medium Effort**: ~1-2 days (M2-M3)

---

## APPROVAL REQUIREMENTS

### Requires Executive/Client Approval

- ✅ C1: JWT revocation (security architecture change)
- ✅ C2: Author ownership (role permission change)
- ✅ C4: Dual backend resolution (infrastructure change)

### Requires Technical Lead Approval

- ✅ H1: Frontend error handling (UX change)
- ✅ H2: Rollback SOP (operational procedure)
- ✅ H3: Health monitoring (monitoring integration)

### Internal Decision (No Approval Needed)

- ✅ C3: Gallery delete auth (bug fix)
- ✅ M2: _bootstrap.php refactor (internal code quality)
- ✅ M3: Logout all devices (additive feature)

---

**Recommendations Completed By**: Principal Security Architect & System Evolution Engineer  
**Date**: January 9, 2026  
**Phase**: 6 (System Evolution & Maturity)  
**Total Recommendations**: 11 (5 Critical, 3 High, 3 Medium)

**END OF PHASE 6 RECOMMENDATIONS**
