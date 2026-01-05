# reCAPTCHA Testing & Debugging Guide

## Quick Test Commands

### 1. Test Backend Connection to Google

```bash
cd server
node test-recaptcha.js
```

Expected output:
```
✅ Secret key loaded: 6LeiPkEsAA...
✅ Connected to Google API
📦 Google Response with error codes (normal for test token)
```

### 2. Test Backend Server

Start server:
```bash
cd server
npm start
```

In another terminal, test endpoint:
```bash
curl -X POST http://localhost:3001/api/verify-recaptcha \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"test_token\"}"
```

Expected: Should return JSON with `success: false` (normal for fake token)

### 3. Test Full Flow with Frontend

1. Start backend:
   ```bash
   cd server
   npm start
   ```

2. Start frontend (in another terminal):
   ```bash
   npm run dev
   ```

3. Open browser: http://localhost:3000
4. Fill registration form and submit
5. Check browser console for logs starting with `[reCAPTCHA]`
6. Check backend terminal for verification logs

## Debug Logs Explained

### Frontend Logs (Browser Console)

```
[reCAPTCHA] Attempting verification with backend: http://localhost:3001/api/verify-recaptcha
[reCAPTCHA] Token length: 500+
[reCAPTCHA] Backend response status: 200
[reCAPTCHA] Backend verification result: {success: true, score: 0.9}
```

**If you see:**
- ❌ "Backend verification failed" → Backend not running or wrong URL
- ❌ "Verification request failed" → CORS issue or network error
- ❌ "Using client-side validation" → Fallback mode (backend unavailable)

### Backend Logs (Terminal)

```
[reCAPTCHA] Token received, length: 500
[reCAPTCHA] Secret key loaded, length: 40
[reCAPTCHA] Calling Google API...
[reCAPTCHA] Google response: {success: true, score: 0.9}
[reCAPTCHA] Verification passed
```

**If you see:**
- ❌ "RECAPTCHA_SECRET_KEY not configured" → Check server/.env
- ❌ "Google API returned non-200" → Google API issue (rare)
- ❌ "Verification error" → Check error message and stack trace

## Common Issues & Solutions

### Issue 1: "Koneksi verifikasi bermasalah"

**Symptoms:**
- Toast shows: "Verifikasi gagal"
- Console: "Backend verification unavailable"

**Solutions:**
1. Check backend is running: `http://localhost:3001/health` should return `{"status":"ok"}`
2. Verify `VITE_RECAPTCHA_API_URL` in frontend `.env`
3. Check CORS: backend must allow frontend origin
4. Test with curl to verify backend works independently

### Issue 2: Backend 500 Error

**Symptoms:**
- Backend logs: "RECAPTCHA_SECRET_KEY not configured"

**Solutions:**
1. Create `server/.env` from `server/.env.example`
2. Add your secret key from Google reCAPTCHA admin
3. Restart backend server

### Issue 3: Low Score / Bot Detection

**Symptoms:**
- Score < 0.5
- Legitimate users blocked

**Solutions:**
1. Test in incognito mode (extensions can affect score)
2. Check Google reCAPTCHA admin console for analytics
3. Lower threshold temporarily for testing (in verify-recaptcha.js)
4. Verify domain registered in Google reCAPTCHA admin

### Issue 4: CORS Error

**Symptoms:**
- Browser console: "CORS policy blocked"
- Network tab shows preflight OPTIONS request failed

**Solutions:**
1. Check `ALLOWED_ORIGINS` in `server/.env` includes your frontend URL
2. Restart backend after changing .env
3. For localhost: `http://localhost:3000`
4. For production: `https://peachpuff-porcupine-369154.hostingersite.com`

### Issue 5: Production Deployment

**For Hostinger deployment:**

1. **Backend .env must include:**
   ```bash
   RECAPTCHA_SECRET_KEY=your_real_secret_key
   ALLOWED_ORIGINS=https://peachpuff-porcupine-369154.hostingersite.com
   NODE_ENV=production
   ```

2. **Frontend .env.production:**
   ```bash
   VITE_RECAPTCHA_SITE_KEY=your_real_site_key
   VITE_RECAPTCHA_API_URL=https://your-backend-domain.com/api/verify-recaptcha
   ```

3. **Update domain in Google reCAPTCHA admin:**
   - Add: `peachpuff-porcupine-369154.hostingersite.com`
   - Add backend domain if different

4. **Test production:**
   - Check browser console for logs
   - Verify backend URL is correct (not localhost)
   - Submit real registration to test

## Production Checklist

Before deploying to production:

- [ ] Backend `.env` has real `RECAPTCHA_SECRET_KEY`
- [ ] Frontend `.env.production` has real `VITE_RECAPTCHA_SITE_KEY`
- [ ] Frontend `VITE_RECAPTCHA_API_URL` points to production backend
- [ ] Both domains registered in Google reCAPTCHA admin
- [ ] CORS `ALLOWED_ORIGINS` includes production frontend domain
- [ ] Backend server running and accessible from internet
- [ ] Test with curl from production frontend domain
- [ ] Submit test registration and verify success

## Testing Checklist

### Local Testing
- [ ] Backend starts without errors
- [ ] Frontend loads reCAPTCHA badge (bottom-right)
- [ ] Form submission generates token
- [ ] Backend receives token and verifies with Google
- [ ] Score >= 0.5 allows submission
- [ ] Score < 0.5 blocks submission
- [ ] Success toast appears on valid submission

### Production Testing
- [ ] Same as above but on production URLs
- [ ] Test from mobile device
- [ ] Test from different networks
- [ ] Check Google reCAPTCHA analytics dashboard

## Getting Help

If still not working:

1. Run: `cd server && node test-recaptcha.js`
2. Copy all console output
3. Copy browser console logs (with `[reCAPTCHA]` prefix)
4. Check network tab for failed requests
5. Verify keys are correct in Google reCAPTCHA admin

## Performance Notes

- First request may be slower (~500ms) due to Google API
- Subsequent requests cached by Google (~100ms)
- Timeout set to 15s for frontend, 10s for backend
- Fallback mode activates if backend unavailable
