# SECURITY REQUIREMENTS — SMP Muhammadiyah 35 Jakarta Website

## GOAL
Harden the website against:
DDoS, XSS, CSRF, SQL Injection, spam, data theft, user-input injection, and defacing.
Do NOT break UI, UX, or SEO. Keep performance fast.

Stack: React + Vite + Tailwind + static deploy (Hostinger)

====================================================
1. USER INPUT VALIDATION (VERY IMPORTANT)
====================================================

For ALL form fields (name, school, WhatsApp, etc):

• Trim whitespace  
• Reject HTML tags  
• Reject scripts  
• Reject SQL keywords  
• Reject special characters  
• Block emoji  
• Max length 100  

Implement a global sanitizer like:

```js
export function sanitizeInput(v) {
  return v
    .trim()
    .replace(/[<>/{}$%^*;()=+`~|]/g, "")
    .replace(/\s+/g, " ")
    .substring(0, 100);
}
```

✓ Apply sanitizer BEFORE storing
✓ Apply sanitizer BEFORE rendering

Never echo raw user input.

====================================================
2. XSS PROTECTION
=================

MANDATORY:
• Never use dangerouslySetInnerHTML
• Always escape output
• Reject HTML input
• DO NOT render user HTML

Apply CSP headers:

Content-Security-Policy:
default-src 'self';
script-src 'self' https:;
style-src 'self' https: 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https:;
frame-ancestors 'none';
form-action 'self';

====================================================
3. SQL / INJECTION PREVENTION
=============================

If DB exists now or later:

• Always use prepared statements
• Never string-concat SQL
• Reject operator characters in fields
• Treat all user input as unsafe

====================================================
4. FORM SPAM & DDOS REDUCTION
=============================

Implement:
• Honeypot hidden field
• Ignore bots filling honeypot
• Rate-limit submissions
• Block >5 submissions per IP / hour
• Optional captcha when abused

====================================================
5. FILE UPLOAD (IF ENABLED)
===========================

Allowed only:
jpg, jpeg, png, webp
Max 3MB

Rename file:
timestamp-originalname.ext

Strip EXIF metadata

NEVER ALLOW:
php, js, svg, exe, bat

Do NOT store uploads in public root.

====================================================
6. ADMIN PANEL SECURITY
=======================

• Strong password
• Brute force lockout
• Auto logout
• Token rotation
• HttpOnly secure cookies only
• Never store auth tokens in localStorage

====================================================
7. PRIVACY & DATA SAFETY
========================

• Mask phone numbers in UI
• Do not log sensitive data
• Drop unnecessary fields
• Encrypt storage if possible
• Delete expired data

====================================================
8. SECURITY HEADERS
===================

Add:

X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()

Enforce HTTPS + HSTS:

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

====================================================
9. CODE REVIEW CHECKLIST
========================

Before merging code ensure:

[ ] No inline scripts
[ ] No eval
[ ] No raw HTML rendering
[ ] All inputs sanitized
[ ] All sensitive logs removed
[ ] CSP active
[ ] Admin panel secured
[ ] Form spam protection active
[ ] Headers configured

Test payloads MUST BE REJECTED:

<script>alert(1)</script>

' OR 1=1 --
DROP TABLE users
"><img src=x onerror=alert(1)>

====================================================
10. DEPLOY SAFETY
=================

• Lock write permissions
• Disable directory listing
• Enable build pipeline only deploy (no manual overwrite)
• Backups enabled

====================================================
FINAL GOAL
==========

System must be safe from:
XSS, injection, data theft, spam, brute force, malicious upload, and tampering.

Do NOT modify UI or SEO behavior.
Do NOT degrade performance.
