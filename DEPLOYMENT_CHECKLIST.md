# 🚀 Production Deployment Checklist

Complete this checklist before deploying to production.

## 📋 Pre-Deployment

### 1. Environment Setup

#### Frontend (.env)
- [ ] `VITE_RECAPTCHA_SITE_KEY` configured with production key
- [ ] `VITE_RECAPTCHA_API_URL` points to production backend
- [ ] Test keys removed (no localhost keys)
- [ ] `.env` not committed to Git

#### Backend (server/.env)
- [ ] `RECAPTCHA_SECRET_KEY` configured with Google secret
- [ ] `ALLOWED_ORIGINS` includes production domain(s)
- [ ] `NODE_ENV=production`
- [ ] `PORT` set correctly (default: 3001)
- [ ] `.env` not committed to Git

### 2. Google reCAPTCHA Configuration

- [ ] Registered production domain at https://www.google.com/recaptcha/admin
- [ ] reCAPTCHA v3 selected
- [ ] Added domains:
  - [ ] `peachpuff-porcupine-369154.hostingersite.com`
  - [ ] Any additional domains
- [ ] Site key copied to frontend `.env`
- [ ] Secret key copied to backend `.env`
- [ ] Test keys removed from both environments

### 3. Code Review

- [ ] No `console.log` with sensitive data
- [ ] No hardcoded secrets or API keys
- [ ] No commented-out production URLs
- [ ] Error messages don't leak implementation details
- [ ] All TODO comments addressed or documented

### 4. Security Verification

- [ ] `.gitignore` includes `.env` files
- [ ] No secrets in Git history (check with `git log --all -S "RECAPTCHA_SECRET"`)
- [ ] CORS whitelist configured correctly
- [ ] Rate limiting enabled (if implemented)
- [ ] HTTPS enforced (no HTTP in production)

### 5. Build & Test

#### Frontend
```bash
# Clean build
rm -rf dist node_modules
npm install --production
npm run build

# Verify build artifacts
ls -la dist/
```

- [ ] Build completes without errors
- [ ] No build warnings (or documented)
- [ ] `dist/` folder created
- [ ] `index.html` exists in `dist/`
- [ ] Assets folder contains CSS/JS bundles

#### Backend
```bash
cd server
rm -rf node_modules
npm install --production
npm start

# Test in another terminal
curl http://localhost:3001/health
```

- [ ] Dependencies install successfully
- [ ] Server starts without errors
- [ ] Health check returns 200 OK
- [ ] No warning messages (or documented)

### 6. Functional Testing

#### Registration Form
- [ ] Form loads correctly
- [ ] reCAPTCHA badge appears (bottom-right)
- [ ] All fields required validation works
- [ ] Phone number validation (10-15 digits)
- [ ] Submit with valid data succeeds
- [ ] Success toast appears
- [ ] Data saved to localStorage
- [ ] WhatsApp redirect works

#### reCAPTCHA Flow
- [ ] Token requested on submit
- [ ] Backend verification called (check network tab)
- [ ] Valid submissions pass (score >= 0.5)
- [ ] Invalid/bot submissions blocked
- [ ] Honeypot field catches bots (hidden field test)
- [ ] Rate limiting works (test 2 submissions < 60s apart)

#### Article Routing
- [ ] Articles list loads
- [ ] Click article navigates to detail
- [ ] URL contains slug: `#article-{slug}`
- [ ] Article detail renders
- [ ] Back button works
- [ ] Direct URL navigation works

#### SEO & Meta Tags
- [ ] View page source shows meta tags
- [ ] Open Graph tags present (`og:title`, `og:description`, `og:image`)
- [ ] Twitter Card tags present
- [ ] Schema.org structured data present
- [ ] Test with Facebook Sharing Debugger
- [ ] Test with Twitter Card Validator

## 🚢 Deployment Steps

### Frontend Deployment (Hostinger/cPanel)

1. **Build Production Bundle**:
   ```bash
   npm run build
   ```

2. **Upload to Server**:
   - Connect via FTP/SFTP to Hostinger
   - Navigate to `public_html/smpmuh/`
   - Upload all contents of `dist/` folder:
     - `index.html`
     - `assets/` folder
     - `.htaccess`

3. **Verify Upload**:
   - [ ] All files uploaded successfully
   - [ ] `.htaccess` in place
   - [ ] `index.html` readable
   - [ ] `assets/` folder contains CSS/JS bundles

4. **Test Deployed Site**:
   - [ ] Visit: https://peachpuff-porcupine-369154.hostingersite.com/smpmuh/
   - [ ] Homepage loads
   - [ ] Navigation works
   - [ ] Images load correctly
   - [ ] No 404 errors in console

### Backend Deployment (Hostinger Node.js App)

1. **Prepare Files**:
   ```bash
   cd server
   zip -r backend.zip . -x "node_modules/*" ".env" "*.log"
   ```

2. **Upload & Install**:
   - Upload `backend.zip` to Hostinger
   - Unzip in hosting control panel
   - Or upload via Git if available

3. **Configure Environment**:
   - In Hostinger control panel → Node.js App
   - Add environment variables:
     - `RECAPTCHA_SECRET_KEY`: Your Google secret
     - `ALLOWED_ORIGINS`: Production domain
     - `NODE_ENV`: production
     - `PORT`: 3001 (or hosting-assigned port)

4. **Install Dependencies**:
   ```bash
   cd /path/to/backend
   npm install --production
   ```

5. **Start Server**:
   ```bash
   npm start
   # Or use PM2
   pm2 start index.js --name smpmuh35-api
   pm2 save
   pm2 startup
   ```

6. **Test Backend**:
   ```bash
   curl https://your-backend-domain.com/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

### Connect Frontend to Backend

1. **Update Frontend Environment**:
   ```bash
   # .env.production
   VITE_RECAPTCHA_SITE_KEY=your_production_site_key
   VITE_RECAPTCHA_API_URL=https://your-backend-domain.com/api/verify-recaptcha
   ```

2. **Rebuild & Redeploy Frontend**:
   ```bash
   npm run build
   # Re-upload dist/ to hosting
   ```

3. **Test Integration**:
   - [ ] Submit registration form
   - [ ] Check browser network tab
   - [ ] Verify POST to `/api/verify-recaptcha`
   - [ ] Confirm 200 response with `{"success":true}`

## ✅ Post-Deployment Verification

### Immediate Checks (Within 5 minutes)

- [ ] Homepage loads without errors
- [ ] Registration form visible
- [ ] reCAPTCHA badge appears
- [ ] Submit test registration (use real data)
- [ ] Check backend logs for request
- [ ] Verify no 500 errors

### Extended Checks (Within 1 hour)

- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test slow 3G connection (Chrome DevTools)
- [ ] Submit multiple registrations
- [ ] Check rate limiting (2 submissions < 60s apart)
- [ ] Test article navigation and slugs

### SEO Validation (Within 24 hours)

- [ ] Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Share article link on WhatsApp (check preview)
- [ ] Submit sitemap to Google Search Console
- [ ] Check robots.txt accessibility

### Monitoring Setup

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure error alerting (email/SMS)
- [ ] Enable access logs
- [ ] Set up log rotation
- [ ] Configure backup schedule

## 🚨 Rollback Plan

If deployment fails:

1. **Keep Old Version**:
   - Before deployment, backup current `dist/` folder
   - Keep previous backend version

2. **Quick Rollback**:
   ```bash
   # Frontend
   cp -r dist.backup/* dist/
   
   # Backend
   pm2 restart smpmuh35-api --update-env
   ```

3. **Verify Rollback**:
   - [ ] Site loads correctly
   - [ ] Forms work
   - [ ] No errors in console

4. **Debug & Fix**:
   - Review deployment logs
   - Check environment variables
   - Test locally with production config
   - Fix issues
   - Redeploy

## 📞 Support Contacts

- **Hosting Support**: Hostinger support ticket
- **Google reCAPTCHA**: https://support.google.com/recaptcha/
- **Developer**: [Your contact info]

## 📝 Deployment Log

**Date**: _____________  
**Deployed By**: _____________  
**Version**: _____________  
**Changes**: 
- [ ] 
- [ ] 
- [ ] 

**Issues Encountered**: 
- [ ] 
- [ ] 

**Resolution**: 
- [ ] 
- [ ] 

**Sign-off**: _____________

---

**Keep this checklist updated after each deployment!**
