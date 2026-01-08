# ═══════════════════════════════════════════════════════════
# ENVIRONMENT CONFIGURATION
# ═══════════════════════════════════════════════════════════
#
# Copy this file to `.env` and fill in your values
# NEVER commit `.env` to version control
#
# Required variables marked with [REQUIRED]
# Optional variables marked with [OPTIONAL]
#
# ═══════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────
# APPLICATION SETTINGS
# ───────────────────────────────────────────────────────────

# Environment: production, staging, or local
# Controls fail-fast validation, error verbosity, debug output
# [REQUIRED in production]
APP_ENV=local

# Debug mode: enables detailed error messages (DEV/STAGING ONLY)
# MUST be false in production
# [OPTIONAL, default: false]
APP_DEBUG=false

# Base URL of the application (for absolute links, redirects)
# [OPTIONAL]
APP_URL=http://localhost:5173

# ───────────────────────────────────────────────────────────
# DATABASE CONFIGURATION
# ───────────────────────────────────────────────────────────

# Database host
# [REQUIRED]
DB_HOST=localhost

# Database name
# [REQUIRED]
DB_NAME=smpmuh35_web

# Database user
# [REQUIRED]
DB_USER=root

# Database password
# [REQUIRED]
# SECURITY: Use strong password, never commit to version control
DB_PASS=

# Database charset (usually utf8mb4)
# [OPTIONAL, default: utf8mb4]
DB_CHARSET=utf8mb4

# ───────────────────────────────────────────────────────────
# SECURITY SETTINGS
# ───────────────────────────────────────────────────────────

# JWT signing secret
# [REQUIRED]
# SECURITY:
# - MUST be cryptographically random
# - Minimum 32 characters
# - Generate with: openssl rand -hex 32
# - Changing this invalidates all existing tokens
JWT_SECRET=

# JWT token expiration (in seconds)
# [OPTIONAL, default: 21600 (6 hours)]
JWT_EXPIRY=21600

# ───────────────────────────────────────────────────────────
# RECAPTCHA (OPTIONAL)
# ───────────────────────────────────────────────────────────

# Google reCAPTCHA v2 secret key
# [OPTIONAL, required if reCAPTCHA enabled in frontend]
# Get from: https://www.google.com/recaptcha/admin
RECAPTCHA_SECRET_KEY=

# ───────────────────────────────────────────────────────────
# LOGGING & MONITORING
# ───────────────────────────────────────────────────────────

# Log level: debug, info, warning, error, critical
# [OPTIONAL, default: error]
LOG_LEVEL=error

# Log destination: file or syslog
# [OPTIONAL, default: file]
LOG_DESTINATION=file

# ───────────────────────────────────────────────────────────
# FILE UPLOAD SETTINGS
# ───────────────────────────────────────────────────────────

# Maximum upload file size (in bytes)
# [OPTIONAL, default: 4000000 (4MB)]
# Note: Also configure in php.ini: upload_max_filesize, post_max_size
UPLOAD_MAX_SIZE=4000000

# Allowed upload MIME types (comma-separated)
# [OPTIONAL, default: image/jpeg,image/png,image/webp]
UPLOAD_ALLOWED_MIMES=image/jpeg,image/png,image/webp

# ═══════════════════════════════════════════════════════════
# PRODUCTION DEPLOYMENT CHECKLIST
# ═══════════════════════════════════════════════════════════
#
# Before deploying to production:
#
# 1. Set APP_ENV=production
# 2. Set APP_DEBUG=false
# 3. Generate strong JWT_SECRET (openssl rand -hex 32)
# 4. Set production database credentials
# 5. Set RECAPTCHA_SECRET_KEY (if using reCAPTCHA)
# 6. Verify php.ini:
#    - display_errors = 0
#    - log_errors = 1
#    - file_uploads = 1
# 7. Run pre-flight check: php pre_flight_check.php
# 8. Test health endpoint: curl https://example.com/api/health.php
#
# ═══════════════════════════════════════════════════════════
