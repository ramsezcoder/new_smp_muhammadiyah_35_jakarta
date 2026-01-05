# Backend API Security Checklist

## ✅ Implemented Security Features

### 1. Secret Key Management
- [x] `RECAPTCHA_SECRET_KEY` stored in environment variables only
- [x] Never hardcoded in source code
- [x] Never logged to console or files
- [x] Not exposed in API responses
- [x] `.env` files in `.gitignore`
- [x] `.env.example` provides template without actual secrets

### 2. Request Validation
- [x] Content-Type validation (must be `application/json`)
- [x] Token existence validation
- [x] Token type validation (must be string)
- [x] Empty/whitespace token rejection
- [x] Malformed JSON handled gracefully

### 3. CORS Protection
- [x] Whitelist-based origin validation
- [x] Configurable allowed origins via environment
- [x] Credentials support (cookies/auth headers)
- [x] Preflight request handling

### 4. Response Security
- [x] No raw Google API response forwarded to client
- [x] Sanitized response: only `success`, `score`, `action`
- [x] No error details leaked to client
- [x] Generic error messages for failures
- [x] Proper HTTP status codes (400, 415, 500)

### 5. Error Handling
- [x] Try/catch blocks on all async operations
- [x] Network errors caught and handled
- [x] Google API errors handled gracefully
- [x] Server errors return 500 with safe message
- [x] No stack traces exposed to client

### 6. Security Headers
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: DENY`
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Cache-Control: no-store` on API routes
- [x] `Pragma: no-cache`

### 7. Score Validation
- [x] Score threshold enforcement (0.5 minimum)
- [x] Score type validation (must be number)
- [x] Success boolean check
- [x] Action verification logged
- [x] Suspicious activity logged (without secrets)

### 8. Logging & Monitoring
- [x] Suspicious attempts logged with details:
  - Score
  - Action
  - Hostname
  - Timestamp
  - IP address (if available)
  - Error codes
- [x] No secrets in logs
- [x] Server errors logged safely
- [x] Environment startup logged

### 9. Rate Limiting (Recommended Add-on)
- [ ] TODO: Add express-rate-limit middleware
- [ ] TODO: Limit to 10 requests/minute per IP
- [ ] TODO: Block repeated failures

### 10. IP Validation (Optional)
- [x] Remote IP sent to Google for validation
- [x] Uses `req.ip` from Express
- [x] Works with proxy/load balancer headers

## 🔒 Deployment Security Checklist

### Before Deploying to Production:

- [ ] **Environment Variables Set**:
  - [ ] `RECAPTCHA_SECRET_KEY` configured
  - [ ] `ALLOWED_ORIGINS` includes production domain
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` configured correctly

- [ ] **Files Not Committed**:
  - [ ] `.env` not in repository
  - [ ] `node_modules/` excluded
  - [ ] Logs excluded
  - [ ] No test API keys in code

- [ ] **Server Hardening**:
  - [ ] Firewall configured
  - [ ] SSH key-based auth only
  - [ ] Non-root user for Node.js
  - [ ] Process manager (PM2/systemd)
  - [ ] SSL/TLS certificate installed
  - [ ] HTTPS enforced

- [ ] **Monitoring**:
  - [ ] Health check endpoint accessible
  - [ ] Log aggregation configured
  - [ ] Error alerting setup
  - [ ] Uptime monitoring active

- [ ] **Backup**:
  - [ ] Environment variables backed up securely
  - [ ] Recovery plan documented
  - [ ] Secrets stored in password manager

## 🚨 Incident Response

### If Secret Key is Exposed:

1. **Immediately revoke** the key in Google reCAPTCHA admin
2. **Generate new keys** (site key + secret key)
3. **Update environment variables**:
   - Backend: `RECAPTCHA_SECRET_KEY`
   - Frontend: `VITE_RECAPTCHA_SITE_KEY`
4. **Redeploy** both frontend and backend
5. **Test** reCAPTCHA functionality
6. **Review logs** for suspicious activity during exposure
7. **Document** the incident

### If Suspicious Activity Detected:

1. Review server logs for patterns
2. Check Google reCAPTCHA analytics dashboard
3. Temporarily increase score threshold (e.g., 0.7)
4. Add rate limiting if not present
5. Block suspicious IPs at firewall level
6. Monitor for continued attacks

## 📋 Regular Maintenance

### Weekly:
- [ ] Review reCAPTCHA analytics dashboard
- [ ] Check for suspicious patterns in logs
- [ ] Verify backend health endpoint

### Monthly:
- [ ] Review and rotate secrets if needed
- [ ] Update dependencies: `npm audit fix`
- [ ] Review CORS allowed origins
- [ ] Check SSL certificate expiry

### Quarterly:
- [ ] Security audit of codebase
- [ ] Penetration testing (if budget allows)
- [ ] Review and update security policies

## 🧪 Security Testing

### Manual Tests:

1. **Test Missing Token**:
   ```bash
   curl -X POST http://localhost:3001/api/verify-recaptcha \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   Expected: 400 status, `"Missing or invalid token"`

2. **Test Invalid Content-Type**:
   ```bash
   curl -X POST http://localhost:3001/api/verify-recaptcha \
     -H "Content-Type: text/plain" \
     -d '{"token":"test"}'
   ```
   Expected: 415 status, Content-Type error

3. **Test CORS**:
   ```bash
   curl -X OPTIONS http://localhost:3001/api/verify-recaptcha \
     -H "Origin: https://unauthorized-domain.com"
   ```
   Expected: CORS error if domain not in whitelist

4. **Test Valid Request** (need real token):
   ```bash
   curl -X POST http://localhost:3001/api/verify-recaptcha \
     -H "Content-Type: application/json" \
     -d '{"token":"03AGdBq27..."}'
   ```
   Expected: 200 status, `{"success":true,"score":0.9}`

### Automated Tests (TODO):

```javascript
// test/verify-recaptcha.test.js
describe('POST /api/verify-recaptcha', () => {
  it('should reject missing token', async () => {
    const res = await request(app)
      .post('/api/verify-recaptcha')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid content-type', async () => {
    const res = await request(app)
      .post('/api/verify-recaptcha')
      .set('Content-Type', 'text/plain')
      .send('{"token":"test"}');
    expect(res.status).toBe(415);
  });

  // Add more tests...
});
```

## 📚 References

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

## ✅ Compliance

This implementation follows:
- ✅ OWASP API Security guidelines
- ✅ Google reCAPTCHA best practices
- ✅ Express.js security recommendations
- ✅ Node.js security best practices
- ✅ Zero-trust security model

---

**Last Updated**: January 6, 2026  
**Review Frequency**: Quarterly  
**Next Review**: April 6, 2026
