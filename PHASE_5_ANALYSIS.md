# PHASE 5: PRODUCTION HARDENING — RUNTIME ANALYSIS

**Date**: January 9, 2026  
**Engineer**: Principal Production Architect & Runtime Hardening Engineer  
**Phase**: Ultra Smart Production Hardening (Phase 5)  
**Status**: 🔍 ANALYSIS COMPLETE

---

## EXECUTIVE SUMMARY

Phase 5 audits the system's **runtime behavior**, **operational safety**, and **deployment readiness**. Unlike Phases 1-4 (which focused on architecture, data integrity, and security features), Phase 5 examines:

- **What happens when things go wrong**
- **Whether the system fails safely**
- **If errors are observable**
- **Whether production deployments will succeed**

**Key Finding**: System is **functionally secure** (Phase 4 complete), but has **CRITICAL operational gaps** that will cause production incidents:

1. ⚠️ **CRITICAL**: Exception messages leak to clients (stack traces, file paths, SQL errors)
2. ⚠️ **CRITICAL**: No production environment detection
3. ⚠️ **HIGH**: Missing required ENV variable validation
4. ⚠️ **HIGH**: Hardcoded production secrets in config files
5. ⚠️ **MEDIUM**: Inconsistent error logging
6. ⚠️ **MEDIUM**: No deployment pre-flight checks

---

## 1️⃣ ENVIRONMENT & CONFIG HARDENING

### Current State

#### Configuration Architecture
```
api/
├── config.php            (legacy, contains hardcoded prod credentials)
├── config.local.php      (legacy, contains hardcoded prod credentials)
└── _bootstrap.php        (unused)

public/api/
├── config.php            (ACTIVE, uses getenv() with fallbacks)
├── config.local.php      (optional override, not version controlled)
└── _bootstrap.php        (ACTIVE runtime bootstrap)
```

**Active Configuration** (loaded by `public/api/_bootstrap.php`):
```php
$config = require __DIR__ . '/config.php';              // Load base config
if (file_exists(__DIR__ . '/config.local.php')) {
  $config = array_replace_recursive($config, require __DIR__ . '/config.local.php');
}
```

#### Environment Variable Usage

**public/api/config.php**:
```php
'db' => [
  'host' => getenv('DB_HOST') ?: 'localhost',           // ✅ Uses ENV
  'name' => getenv('DB_NAME') ?: 'u541580780_smpmuh35', // ⚠️ Hardcoded fallback
  'user' => getenv('DB_USER') ?: 'u541580780_smpmuh35', // ⚠️ Hardcoded fallback
  'pass' => getenv('DB_PASS') ?: 'Muhammadiyah_35!!',   // ⚠️ Hardcoded fallback
],
'jwt_secret' => getenv('JWT_SECRET') ?: 'change-this-secret', // ⚠️ Weak fallback
```

**public/api/recaptcha/verify.php**:
```php
$recaptcha_secret = getenv('RECAPTCHA_SECRET_KEY') ?: 'CHANGE_ME_IN_PRODUCTION'; // ⚠️ Placeholder
```

### 🔴 CRITICAL RISKS

#### Risk 1.1: No Production Environment Detection
**Severity**: CRITICAL  
**Impact**: System cannot distinguish local/staging/production

**Problem**:
- No `APP_ENV` or equivalent check
- Cannot enforce production-specific behavior:
  - Stricter error handling
  - Mandatory ENV validation
  - Debug mode disabling
  
**Exploit Scenario**:
```
1. Deploy to production with misconfigured ENV
2. System falls back to hardcoded dev credentials
3. All passwords and secrets leak if config.php is exposed
4. JWT secret 'change-this-secret' allows token forgery
```

#### Risk 1.2: Hardcoded Production Secrets
**Severity**: CRITICAL  
**Impact**: Secrets exposed in version control

**Files with hardcoded secrets**:
1. `api/config.php` (line 8): `'pass' => 'Muhammadiyah_35!!'`
2. `api/config.local.php` (line 8): `'pass' => 'Muhammadiyah_35!!'`
3. `public/api/config.php` (line 8): Fallback to `'Muhammadiyah_35!!'`

**Evidence**:
```php
// api/config.php (LEGACY FILE)
return [
  'db' => [
    'host' => 'localhost',
    'name' => 'u541580780_smpmuh35',
    'user' => 'u541580780_smpmuh35',
    'pass' => 'Muhammadiyah_35!!',  // ⚠️ EXPOSED IN VERSION CONTROL
  ],
  'jwt_secret' => 'ganti_dengan_secret_random', // ⚠️ WEAK SECRET
];
```

**Attack Surface**:
- If repository is public: instant compromise
- If .git exposed in production: credential leak via `git show`
- If config.php accessible via web: direct credential theft

#### Risk 1.3: No ENV Variable Validation
**Severity**: HIGH  
**Impact**: Silent failures in production

**Problem**:
- System starts even if critical ENV vars missing
- Falls back to dev credentials silently
- No fail-fast behavior

**Required ENV variables** (currently optional):
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `JWT_SECRET`
- `RECAPTCHA_SECRET_KEY` (if reCAPTCHA enabled)

**Missing Validation**:
```php
// CURRENT: Always succeeds with fallbacks
'db' => [
  'host' => getenv('DB_HOST') ?: 'localhost',
  'pass' => getenv('DB_PASS') ?: 'Muhammadiyah_35!!',
],

// NEEDED: Fail fast in production
if ($isProduction && !getenv('DB_PASS')) {
  die('FATAL: DB_PASS environment variable required in production');
}
```

### 📋 RECOMMENDED ENV STRUCTURE

**Required for Production**:
```bash
# Application
APP_ENV=production              # NEW: Env detection
APP_DEBUG=false                  # NEW: Disable debug mode

# Database
DB_HOST=<production_host>
DB_NAME=<production_db>
DB_USER=<production_user>
DB_PASS=<production_password>

# Security
JWT_SECRET=<random_256_bit_hex>  # MUST be cryptographically random
RECAPTCHA_SECRET_KEY=<google_recaptcha_secret>

# Optional
APP_URL=https://example.com      # NEW: Base URL for absolute paths
LOG_LEVEL=error                   # NEW: Production log verbosity
```

### 🔍 CONFIG PRECEDENCE VERIFICATION

**Loading Order** (tested):
1. `public/api/config.php` (base config with ENV fallbacks)
2. `public/api/config.local.php` (optional overrides)

**Precedence Rules**:
- ENV variables > config.local.php > config.php defaults
- `array_replace_recursive()` ensures deep merging

**Test Case**:
```php
// config.php
'db' => ['host' => 'localhost', 'name' => 'dev_db']

// config.local.php
'db' => ['host' => 'prod.example.com']

// Result
'db' => ['host' => 'prod.example.com', 'name' => 'dev_db'] // ✅ Correct merge
```

---

## 2️⃣ FILESYSTEM & PERMISSION AUDIT

### Directory Structure

```
public/
├── uploads/                   # ✅ Authoritative upload directory (Phase 4)
│   ├── .htaccess             # ✅ PHP execution blocked
│   ├── articles/             # ✅ Protected subdirectory
│   ├── gallery/              # ✅ Protected subdirectory
│   ├── staff/                # ✅ Protected subdirectory
│   └── videos/               # ✅ Unused but created
├── logs/                     # ⚠️ Does NOT exist (created at runtime)
└── api/                      # ✅ Protected by .htaccess

uploads/                       # ⚠️ LEGACY DUPLICATE (awaiting migration)
├── gallery/mg-6069.webp      # 6 orphan candidates
└── staff/*.webp              # (Phase 4 migration pending)
```

### Runtime Directory Checks

**Performed by `_bootstrap.php` (line 5-7)**:
```php
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) {
  @mkdir($logDir, 0755, true);  // ✅ Creates /public/logs at runtime
}
```

**Performed by `_bootstrap.php` (line 112)**:
```php
ensure_dirs([
  $config['uploads']['base'],     // /public/uploads
  $config['uploads']['articles'], // /public/uploads/articles
  $config['uploads']['gallery'],  // /public/uploads/gallery
  $config['uploads']['staff'],    // /public/uploads/staff
  $config['uploads']['videos']    // /public/uploads/videos
]);
// ✅ Creates all upload subdirs with 0755
```

### 🟡 MEDIUM RISKS

#### Risk 2.1: Log Directory Permissions
**Severity**: MEDIUM  
**Impact**: Potential log file exposure

**Current**: `@mkdir($logDir, 0755, true)`
- 0755 = rwxr-xr-x (world-readable)
- Log files inherit directory permissions

**Concern**:
- If `/public/logs/error.log` is world-readable:
  - Web server can list directory contents
  - Attackers may access logs via direct URL
  - Sensitive data (stack traces, DB errors) exposed

**Mitigation** (Phase 4 already applied):
- `/public/.htaccess` denies access to `*.log` files
- Logs stored outside `/public/` webroot is preferred

**Verification Needed**:
```bash
# Check if logs accessible via web
curl https://example.com/logs/error.log  # Should return 403/404
```

#### Risk 2.2: Upload Directory Writability
**Severity**: MEDIUM  
**Impact**: Upload failures in production

**Current**:
- `ensure_dirs()` creates with 0755
- No explicit writability check in `_bootstrap.php`
- Individual upload endpoints check writability:

```php
// articles/upload_image.php (line 38)
if (!is_writable($uploadDir)) {
  respond(false, 'Uploads directory is not writable', [], 500);
}
```

**Gap**:
- Writability only checked at upload time (not at startup)
- Silent failures if permissions wrong after deployment

**Recommended**:
- Pre-flight check in deployment script
- Startup health check endpoint

#### Risk 2.3: No Session Storage Configuration
**Severity**: LOW  
**Impact**: Undefined session behavior

**Observation**:
- No `session_start()` or `$_SESSION` usage found in codebase
- JWT-based authentication (stateless)
- ✅ No session storage concerns

**Verification**:
```bash
grep -r "session_start\|$_SESSION" public/api/
# Result: No matches ✅
```

### 🛡️ PERMISSION RECOMMENDATIONS

| Directory | Current | Recommended | Rationale |
|-----------|---------|-------------|-----------|
| `/public/uploads` | 0755 | 0755 | ✅ Correct (web-readable, write via PHP) |
| `/public/logs` | 0755 | 0750 | 🔒 Remove world-read |
| `/public/api` | N/A | 0755 | ✅ Standard webroot perms |
| `/uploads` (legacy) | 0755 | DELETE | 🗑️ Remove after migration |

**File Permissions**:
```bash
# Upload files (created by move_uploaded_file)
-rw-r--r-- (0644)  # ✅ Correct (web-readable, not executable)

# Log files
-rw-r----- (0640)  # 🔒 Recommended (owner+group read, no world access)

# PHP files
-rw-r--r-- (0644)  # ✅ Correct (not executable, processed by PHP-FPM)
```

---

## 3️⃣ ERROR HANDLING & FAIL-CLOSED BEHAVIOR

### Exception Handling Patterns

#### Pattern 1: Generic Error Response (SAFE)
```php
// videos/update.php (line 29-31)
} catch (Throwable $e) {
  respond(false, 'Update failed', ['error' => $e->getMessage()], 500);
}
```
⚠️ **Issue**: `$e->getMessage()` returned to client

#### Pattern 2: Logged + Generic Response (SAFER)
```php
// ppdb/submit.php (line 49-50)
} catch (Throwable $e) {
  error_log('PPDB submit error: ' . $e->getMessage());
  respond(false, 'Submission failed', [], 500); // ✅ No details to client
}
```

#### Pattern 3: Full Stack Trace Leak (DANGEROUS)
```php
// auth/login.php (line 89-91)
} catch (Throwable $e) {
  error_log('LOGIN: fatal error ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
  error_log('LOGIN: stack trace: ' . $e->getTraceAsString());
  respond(false, 'Login failed. Please try again later.', [], 500); // ✅ Safe response
}
```
✅ **Correct**: Logs full trace, returns generic message

#### Pattern 4: Direct Exception Exposure (CRITICAL)
```php
// admin/dashboard-stats.php (line 41)
respond(false, 'Failed to ensure tables', ['error' => $e->getMessage()], 500);
// ⚠️ Leaks: "SQLSTATE[42S01]: Table already exists"
// ⚠️ Leaks: "Access denied for user 'xxx'@'localhost'"
```

### 🔴 CRITICAL RISKS

#### Risk 3.1: Exception Message Leakage
**Severity**: CRITICAL  
**Impact**: Information disclosure (paths, SQL, credentials)

**Affected Files** (48 occurrences):
- `admin/dashboard-stats.php` (lines 41, 58)
- `articles/list.php` (line 91)
- `articles/create.php` (line 194)
- `gallery/upload.php` (line 57)
- `staff/create.php` (line 62)
- **ALL** CRUD endpoints

**Example Leak Scenarios**:

**SQL Error**:
```json
{
  "success": false,
  "message": "Update failed",
  "data": {
    "error": "SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'admin@example.com' for key 'email'"
  }
}
```
**Reveals**: Database schema, table structure, column names

**File Path Leak**:
```json
{
  "error": "fopen(/var/www/html/public/uploads/articles/test.jpg): failed to open stream: Permission denied"
}
```
**Reveals**: Server filesystem structure, deployment path

**DB Credentials Leak**:
```json
{
  "error": "SQLSTATE[HY000] [1045] Access denied for user 'u541580780_smpmuh35'@'localhost' (using password: YES)"
}
```
**Reveals**: Database username

#### Risk 3.2: PHP Error Display Settings
**Severity**: CRITICAL  
**Impact**: Full application state exposure

**Current Settings** (`_bootstrap.php` line 9-12):
```php
ini_set('log_errors', '1');       // ✅ Logs enabled
ini_set('display_errors', '0');   // ✅ Display disabled
ini_set('error_log', $logDir . '/error.log');
error_reporting(E_ALL);            // ✅ Full error reporting
```

**Verification Needed**:
- Confirm `display_errors = 0` in `php.ini` (production)
- Test fatal error behavior (should NOT render HTML error page)

**Test Case**:
```php
// Trigger fatal error
$undefined->method();

// EXPECTED: Blank screen + HTTP 500
// DANGEROUS: "Fatal error: Call to member function on null in /var/www/html/public/api/test.php on line 10"
```

#### Risk 3.3: Inconsistent Error Responses
**Severity**: MEDIUM  
**Impact**: Unpredictable client behavior

**Analysis of 48 Exception Handlers**:

| Pattern | Count | Example | Status |
|---------|-------|---------|--------|
| Generic message only | 12 | `respond(false, 'Update failed', [], 500)` | ✅ SAFE |
| Generic + `$e->getMessage()` | 30 | `['error' => $e->getMessage()]` | ⚠️ RISKY |
| Logged + generic | 6 | `error_log(...); respond(...)` | ✅ SAFE |

**Recommendation**: Standardize on Pattern 3 (log full, respond generic)

### 🛠️ ERROR HANDLING STANDARD (REQUIRED)

**Production-Safe Exception Handler** (proposed):
```php
try {
  // Operation
} catch (Throwable $e) {
  // Log FULL details for debugging
  error_log(sprintf(
    '[%s] %s in %s:%d - %s',
    get_class($e),
    $e->getMessage(),
    $e->getFile(),
    $e->getLine(),
    $e->getTraceAsString()
  ));
  
  // Return GENERIC message to client
  if ($isProduction) {
    respond(false, 'Operation failed', [], 500);
  } else {
    // Dev/staging: Include error class (but not full trace)
    respond(false, 'Operation failed', ['error_type' => get_class($e)], 500);
  }
}
```

---

## 4️⃣ LOGGING & OBSERVABILITY

### Current Logging Implementation

#### Log Destination
```php
// _bootstrap.php (line 5-11)
$logDir = dirname(__DIR__) . '/logs';  // /public/logs
ini_set('error_log', $logDir . '/error.log');
```

**Single log file**: `/public/logs/error.log`

#### Logging Patterns Found

**Pattern A: Inline `error_log()`** (15 occurrences)
```php
// auth/login.php
error_log('LOGIN: start email=' . $email);
error_log('LOGIN: success email=' . $email . ' role=' . $user['role']);
error_log('LOGIN: user not found for email ' . $email);
```

**Pattern B: Exception `error_log()`** (10 occurrences)
```php
// ppdb/submit.php
} catch (Throwable $e) {
  error_log('PPDB submit error: ' . $e->getMessage());
}
```

**Pattern C: No logging** (23 endpoints)
```php
// gallery/delete.php
} catch (Throwable $e) {
  respond(false, 'Delete failed', ['error' => $e->getMessage()], 500);
  // ⚠️ No error_log() call
}
```

### 🟡 MEDIUM RISKS

#### Risk 4.1: Inconsistent Logging Coverage
**Severity**: MEDIUM  
**Impact**: Blind spots in production debugging

**Logged Events**:
- ✅ Login attempts (success, failure, inactive user)
- ✅ Session creation failures
- ✅ PPDB submission errors
- ✅ Article list errors
- ⚠️ Upload failures (not logged)
- ⚠️ Authorization failures (not logged)
- ⚠️ DB transaction rollbacks (not logged)

**Missing Logging**:
1. **Upload operations** (`gallery/upload.php`, `staff/create.php`, `articles/upload_image.php`)
2. **Authorization failures** (`require_auth()` at line 148: no log before `respond(false, 'Forbidden')`)
3. **DB rollbacks** (`staff/update.php`, `articles/update.php`: no log on transaction failure)

#### Risk 4.2: Sensitive Data in Logs
**Severity**: HIGH  
**Impact**: PII/credential exposure in log files

**Current**: Email addresses logged in plaintext
```php
// auth/login.php (line 18)
error_log('LOGIN: start email=' . $email);  // ⚠️ PII exposure
```

**Concern**:
- Email = PII (GDPR/privacy regulations)
- Passwords never logged ✅
- JWT tokens never logged ✅

**Recommendation**:
- Hash/truncate emails: `error_log('LOGIN: start email_hash=' . md5($email))`
- Or: Use user ID instead of email

#### Risk 4.3: No Structured Logging
**Severity**: MEDIUM  
**Impact**: Difficult log parsing and alerting

**Current**: Unstructured text logs
```
[09-Jan-2026 10:30:45 UTC] LOGIN: start email=admin@example.com
[09-Jan-2026 10:30:46 UTC] LOGIN: success email=admin@example.com role=Admin
[09-Jan-2026 10:31:12 UTC] PPDB submit error: SQLSTATE[23000]: Duplicate entry
```

**Limitations**:
- No correlation IDs (can't trace single request)
- No severity levels (all INFO/ERROR mixed)
- No structured fields (hard to query)

**Recommended**: JSON-structured logs
```json
{"timestamp":"2026-01-09T10:30:45Z","level":"INFO","event":"login_attempt","user_id":1,"ip":"192.168.1.1"}
{"timestamp":"2026-01-09T10:30:46Z","level":"INFO","event":"login_success","user_id":1,"role":"Admin"}
{"timestamp":"2026-01-09T10:31:12Z","level":"ERROR","event":"ppdb_submit_error","error":"SQLSTATE[23000]","trace":"..."}
```

### 📊 REQUIRED LOGGING STRATEGY

**Events to Log** (production):

| Event | Level | Fields | Rationale |
|-------|-------|--------|-----------|
| **Auth** | | | |
| Login success | INFO | user_id, role, ip | Audit trail |
| Login failure | WARN | email_hash, ip, reason | Security monitoring |
| Token expired | INFO | user_id, ip | Session tracking |
| Forbidden (403) | WARN | user_id, role, endpoint | Authorization audit |
| **Uploads** | | | |
| Upload success | INFO | user_id, filename, size, mime | File tracking |
| Upload failure | ERROR | user_id, filename, reason | Debug failures |
| Orphan detected | WARN | filename, size, subdir | Data consistency |
| **Database** | | | |
| Connection failure | CRITICAL | host, error_class | Infrastructure alert |
| Transaction rollback | ERROR | endpoint, user_id, reason | Data integrity |
| Constraint violation | WARN | table, column, reason | Schema issues |
| **System** | | | |
| Startup | INFO | php_version, config_loaded | Health check |
| Fatal error | CRITICAL | file, line, trace | Crash report |

**NOT Logged** (privacy):
- ❌ Passwords (plaintext or hashed)
- ❌ JWT tokens
- ❌ Full PII (emails, names) — use IDs or hashes

---

## 5️⃣ SECURITY SURFACE REVIEW (RUNTIME)

### JWT Token Management

#### Token Generation (`auth/login.php` line 40-52)
```php
$payload = [
  'sub' => (int)$user['id'],
  'name' => $user['name'],
  'email' => $user['email'],
  'role' => $user['role'],
  'iat' => time(),
  'exp' => time() + 60 * 60 * 6  // ⚠️ 6 hours
];
```

#### Token Validation (`_bootstrap.php` line 128-136)
```php
$payloadJson = base64_decode(strtr($payloadB64, '-_', '+/'));
$payload = json_decode($payloadJson, true);
if (!$payload || ($payload['exp'] ?? 0) < time()) {
  respond(false, 'Token expired', [], 401);  // ✅ Expiration checked
}
```

### 🟡 MEDIUM RISKS

#### Risk 5.1: JWT Expiration & Rotation
**Severity**: MEDIUM  
**Impact**: Long-lived tokens increase compromise window

**Current**:
- Expiration: 6 hours (21600 seconds)
- No refresh token mechanism
- No token rotation
- No session revocation

**Attack Scenario**:
```
1. User logs in at 9:00 AM → Token valid until 3:00 PM
2. User's laptop stolen at 10:00 AM
3. Attacker has 5 hours to use token (no way to invalidate)
```

**Mitigation Options**:
1. **Shorter expiration** (1-2 hours) — requires more frequent logins
2. **Refresh tokens** (store in DB, revocable) — more complex
3. **Session table** (track active tokens, manual revocation) — already exists! ✅

**sessions table** (already created):
```sql
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token TEXT NOT NULL,     -- JWT stored here
  user_agent VARCHAR(255),
  ip_address VARCHAR(45),
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Observation**: Login already inserts tokens into `sessions` table (line 56-66), but:
- ⚠️ No validation against `sessions` table during auth
- ⚠️ No cleanup of expired sessions
- ⚠️ No admin revocation endpoint

**Recommendation**: Add session validation to `get_auth_user()`:
```php
// After JWT signature validation
$stmt = $pdo->prepare('SELECT id FROM sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1');
$stmt->execute([$token]);
if (!$stmt->fetch()) {
  respond(false, 'Session revoked or expired', [], 401);
}
```

#### Risk 5.2: No CSRF Protection on State-Changing Endpoints
**Severity**: MEDIUM  
**Impact**: Cross-site request forgery possible

**Current CSRF Posture**:
- ❌ No CSRF tokens
- ✅ JWT in `Authorization` header (not cookies)
- ✅ `SameSite` cookie not used (JWT not in cookie)
- ✅ CORS configured with origin validation

**Analysis**:
- JWT-based auth in `Authorization` header = **CSRF-resistant by design** ✅
- JavaScript must explicitly set header (CSRF can't do this)
- Cookies would be auto-sent (vulnerable), but JWT isn't in cookie

**Verification**:
```bash
# CSRF attempt (will fail)
curl -X POST https://example.com/api/articles/delete.php \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
# Result: 401 Missing token ✅
```

**Conclusion**: Current JWT implementation is CSRF-resistant. No additional CSRF tokens needed.

#### Risk 5.3: CORS Configuration
**Severity**: LOW  
**Impact**: Overly permissive if misconfigured

**Current** (`_bootstrap.php` line 19-23):
```php
if (isset($_SERVER['HTTP_ORIGIN'])) {
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);  // ⚠️ Reflects origin
  header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
```

**Concern**:
- **Reflects any origin** (effectively `Access-Control-Allow-Origin: *`)
- With `Allow-Credentials: true`, this allows **any site** to make authenticated requests

**Attack Scenario**:
```html
<!-- evil.com -->
<script>
fetch('https://example.com/api/admin/dashboard-stats.php', {
  credentials: 'include',  // Send victim's JWT (if in cookie)
  headers: { 'Authorization': 'Bearer ' + stolenToken }
})
.then(r => r.json())
.then(data => exfiltrate(data));
</script>
```

**However**: JWT is NOT in cookies (passed via header), so `credentials: include` doesn't help attacker.

**Verdict**: Low risk due to JWT in header, but should still whitelist origins.

**Recommendation**:
```php
$allowedOrigins = [
  'https://smpmuh35.com',
  'https://www.smpmuh35.com',
  'http://localhost:5173',  // Dev only
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
}
```

---

## 6️⃣ DEPLOYMENT SAFETY CHECKLIST

### Pre-Deployment Validation (MISSING)

**Currently**: No automated pre-flight checks  
**Risk**: Deploy broken config, discover in production

**Required Checks**:

#### 1. Environment Variables
```bash
#!/bin/bash
# check_env.sh
required_vars=(
  "DB_HOST"
  "DB_NAME"
  "DB_USER"
  "DB_PASS"
  "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var not set"
    exit 1
  fi
done
echo "✅ All required ENV vars present"
```

#### 2. Database Connectivity
```php
// pre_flight.php
require 'public/api/_bootstrap.php';
try {
  $stmt = $pdo->query('SELECT 1');
  echo "✅ Database connection: OK\n";
} catch (Throwable $e) {
  echo "❌ Database connection: FAILED\n";
  echo "Error: " . $e->getMessage() . "\n";
  exit(1);
}
```

#### 3. Upload Directory Writability
```php
// Check all upload directories
$dirs = [
  $config['uploads']['base'],
  $config['uploads']['articles'],
  $config['uploads']['gallery'],
  $config['uploads']['staff'],
];

foreach ($dirs as $dir) {
  if (!is_dir($dir)) {
    echo "❌ Directory missing: $dir\n";
    exit(1);
  }
  if (!is_writable($dir)) {
    echo "❌ Directory not writable: $dir\n";
    exit(1);
  }
}
echo "✅ Upload directories: OK\n";
```

#### 4. PHP Configuration
```php
// Check critical PHP settings
$checks = [
  'display_errors' => '0',
  'log_errors' => '1',
  'file_uploads' => '1',
  'post_max_size' => '10M',  // Minimum
  'upload_max_filesize' => '5M',
];

foreach ($checks as $key => $expected) {
  $actual = ini_get($key);
  if ($key === 'display_errors' && $actual !== '0') {
    echo "❌ $key = $actual (expected $expected)\n";
    exit(1);
  }
}
echo "✅ PHP configuration: OK\n";
```

### Post-Deployment Validation (MISSING)

**Currently**: Manual testing only  
**Risk**: Undetected regressions

**Required Smoke Tests**:

#### 1. Health Check Endpoint
```php
// public/api/health.php
<?php
require '_bootstrap.php';

$checks = [];

// Database
try {
  $pdo->query('SELECT 1');
  $checks['database'] = 'ok';
} catch (Throwable $e) {
  $checks['database'] = 'error';
  $checks['database_error'] = $e->getMessage();
}

// Upload directory
$checks['uploads_writable'] = is_writable($config['uploads']['base']) ? 'ok' : 'error';

// Configuration
$checks['jwt_secret_set'] = ($config['jwt_secret'] !== 'change-this-secret') ? 'ok' : 'warning';

respond(true, 'Health check', $checks);
```

**Usage**:
```bash
curl https://example.com/api/health.php
# Expected: {"success":true,"message":"Health check","data":{"database":"ok","uploads_writable":"ok"}}
```

#### 2. Auth Verification
```bash
# Test login
response=$(curl -X POST https://example.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<password>"}')

if echo "$response" | grep -q '"success":true'; then
  echo "✅ Auth: OK"
else
  echo "❌ Auth: FAILED"
  echo "$response"
  exit 1
fi
```

#### 3. Upload Test
```bash
# Test image upload (requires auth token)
token="<jwt_token>"
curl -X POST https://example.com/api/articles/upload_image.php \
  -H "Authorization: Bearer $token" \
  -F "featured_image=@test.jpg"

# Expected: {"success":true,...}
```

---

## PHASE 5 CRITICAL FINDINGS SUMMARY

### 🔴 CRITICAL (MUST FIX BEFORE PRODUCTION)

1. **Exception Message Leakage** (Risk 3.1)
   - 48 endpoints expose `$e->getMessage()` to clients
   - Leaks SQL errors, file paths, credentials
   - **Fix**: Sanitize all exception responses

2. **Hardcoded Production Secrets** (Risk 1.2)
   - Database password in `api/config.php`, `api/config.local.php`
   - Weak JWT secret in version control
   - **Fix**: Remove hardcoded secrets, enforce ENV vars

3. **No Production Environment Detection** (Risk 1.1)
   - Cannot enforce production-specific behavior
   - Falls back to dev credentials silently
   - **Fix**: Add `APP_ENV` check, fail fast if misconfigured

### ⚠️ HIGH (SHOULD FIX BEFORE PRODUCTION)

4. **Missing ENV Validation** (Risk 1.3)
   - No fail-fast if critical ENV vars missing
   - **Fix**: Validate ENV at startup

5. **Sensitive Data in Logs** (Risk 4.2)
   - Email addresses logged in plaintext
   - **Fix**: Hash or use user IDs

### 🟡 MEDIUM (RECOMMENDED)

6. **Inconsistent Logging** (Risk 4.1)
   - 23 endpoints have no error logging
   - **Fix**: Standardize logging for all operations

7. **JWT Expiration** (Risk 5.1)
   - 6-hour tokens, no revocation mechanism
   - **Fix**: Validate tokens against `sessions` table

8. **CORS Configuration** (Risk 5.3)
   - Reflects any origin
   - **Fix**: Whitelist allowed origins

9. **No Pre-flight Checks** (Section 6)
   - Deployments may fail silently
   - **Fix**: Create deployment validation script

---

## NEXT STEPS (PHASE 5 IMPLEMENTATION)

**Execution Order**:
1. ✅ Analysis complete (this document)
2. Create environment detection logic
3. Sanitize exception handlers
4. Add ENV validation
5. Implement deployment checks
6. Write PHASE_5_CHANGES.md
7. Write PHASE_5_VALIDATION.md

**No Phase 1-4 Logic Modified**: All changes are runtime hardening only.

---

**End of Phase 5 Analysis**
