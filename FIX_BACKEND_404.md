# 🚨 CRITICAL: Backend Server Not Running

**Issue:** Your production website has 2 failures:
1. Admin page `/admin` returns **404 Not Found**
2. News API `/api/news/list` returns **404/Connection Error**

**Root Cause:** The **Node.js backend server is NOT running** on your hosting.

---

## 🔴 What's Happening

Your site currently:
```
Frontend (React) ✅ Running on hostingersite.com
   ↓ tries to call
Backend API ❌ NOT RUNNING
```

The frontend **CANNOT** talk to the backend, so:
- `/admin` doesn't load (tries to load from `/admin.html` file, doesn't exist)
- `/api/news/list` fails (no server listening)
- News shows fallback alert (which is working correctly as a fallback)

---

## ✅ THE FIX (Choose One)

### **FAST FIX (Recommended for Testing)**
Deploy backend to **Render.com** (free, takes 5 minutes):

**Step 1:** Create Render account at https://render.com (free)

**Step 2:** Connect your GitHub repo and deploy:
- Build Command: `npm install && cd server && npm install`
- Start Command: `cd server && npm start`
- Environment: `NODE_ENV=production`

**Step 3:** Render gives you a URL like: `https://smp-api-xyz.onrender.com`

**Step 4:** Update frontend to use it

Create file `src/lib/api-config.js`:
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'https://smp-api-xyz.onrender.com';
```

Update API calls (example in `src/pages/news/NewsListPage.jsx`):
```javascript
// Change from: /api/news/list
// To:
const url = `${API_URL}/api/news/list?category=${category}&page=${page}`;
```

**Step 5:** Deploy frontend with new API URL
```bash
npm run build
# Deploy dist/ to hostingersite.com
```

---

### **BETTER FIX (Production-Ready)**
Deploy both frontend + backend to **Vercel** or **Render**:

This is cleaner because frontend and backend are deployed together.

---

## 📋 Implementation Steps

### To Fix Immediately (5 minutes)

1. **Create Render account:** https://render.com
2. **Connect GitHub repo**
3. **Add Web Service:**
   - Runtime: Node
   - Build: `npm install && cd server && npm install`
   - Start: `cd server && npm start`
   - Add env var: `NODE_ENV=production`
4. **Deploy** (takes 2-3 minutes)
5. **Copy your API URL** (e.g., `https://smp-api-abc123.onrender.com`)
6. **Update frontend code** to use new URL
7. **Rebuild frontend and redeploy**

### To Test It Works

```bash
# Test API is running (replace with your Render URL)
curl https://smp-api-xyz.onrender.com/health
# Response: {"status":"ok","timestamp":"..."}

curl https://smp-api-xyz.onrender.com/api/news/list?category=school
# Response: {"success":true,"data":[...],"totalPages":...}
```

---

## 🔧 Code Changes Needed

### Create API Configuration File
**File:** `src/lib/api-config.js`
```javascript
// Use environment variable for API URL
// For local dev: http://localhost:3001
// For production: https://smp-api-xyz.onrender.com
export const API_URL = import.meta.env.VITE_API_URL || '/';

// Helper to construct API URLs
export function apiUrl(path) {
  const base = API_URL === '/' ? '' : API_URL;
  return `${base}${path}`;
}
```

### Update News Page
**File:** `src/pages/news/NewsListPage.jsx`
```javascript
import { apiUrl } from '@/lib/api-config';

// In useEffect:
const url = apiUrl(`/api/news/list?category=${category}&page=${page}&limit=${limit}`);
const response = await fetch(url);
```

### Update Gallery Upload
**File:** `src/components/admin/GalleryManager.jsx`
```javascript
import { apiUrl } from '@/lib/api-config';

// In upload handler:
const response = await fetch(apiUrl('/api/upload/gallery'), {
  method: 'POST',
  headers: { 'x-admin-token': 'SuperAdmin@2025' },
  body: formData
});
```

### Update Environment Variables
**File:** `.env.production`
```env
VITE_API_URL=https://smp-api-xyz.onrender.com
```

---

## 📊 Current vs Fixed

### BEFORE (Now - Broken ❌)
```
Browser                         Hostinger
  │                               │
  ├─ GET /                        ✅ Frontend loads
  ├─ GET /admin            404 ❌ No /admin file
  ├─ GET /api/news/list    404 ❌ No server listening
  └─ POST /api/upload      404 ❌ No server listening
```

### AFTER (Fixed ✅)
```
Browser                Hostinger              Render
  │                      │                      │
  ├─ GET /        ────→  ✅ Frontend loads
  ├─ GET /admin   ────→  ✅ SPA serves index.html ─ Router handles /admin
  │
  ├─ GET /api/news/list ─────────────────────→ ✅ Backend API responds
  ├─ POST /api/upload ──────────────────────→ ✅ Backend handles upload
  └─ GET /api/pdf/views ────────────────────→ ✅ Backend API responds
```

---

## 🎯 Quick Checklist

### Before Deploying Backend
- [ ] Backend runs locally? `cd server && npm start`
- [ ] Can reach `/api/news/list` locally? `curl http://localhost:3001/api/news/list`
- [ ] All dependencies installed? `cd server && npm install`

### After Deploying Backend to Render
- [ ] Render shows "Live" status (green)
- [ ] Can reach backend URL? `curl https://smp-api-xyz.onrender.com/health`
- [ ] Can reach API? `curl https://smp-api-xyz.onrender.com/api/news/list`

### After Updating Frontend Code
- [ ] API URL configured in code/env
- [ ] Frontend builds? `npm run build`
- [ ] Can reach admin page? `https://yourdomain.com/admin` (not 404)
- [ ] News loads? `https://yourdomain.com/news` (not fallback alert)
- [ ] Upload works? Admin → Media Library → Upload succeeds

---

## 🆘 Troubleshooting

**Q: Render says "Build failed"**
A: Check build logs. Make sure `npm install` works locally first.

**Q: Still getting 404 on admin**
A: Frontend not rebuilt. Run `npm run build` and redeploy dist/.

**Q: API still fails**
A: Check your API URL in frontend code. Must match Render URL exactly.

**Q: Upload still fails**
A: Update `apiUrl('/api/upload/gallery')` calls to use new API_URL.

---

## 📞 Immediate Action

1. **Right now:** Go to https://render.com and create account (free)
2. **In 5 min:** Deploy backend server
3. **In 10 min:** Update frontend code with new API URL
4. **In 15 min:** Rebuild and redeploy frontend
5. **Test:** `/admin` should load, news should appear, upload should work

---

## 📚 Full Documentation

See these files for more details:
- `PRODUCTION_DEPLOYMENT.md` - Full deployment guide
- `QUICK_START.md` - Quick reference
- `troubleshoot.js` - Auto-diagnostic tool

---

**Next Step:** Deploy backend to Render, update API URL, rebuild frontend. Takes 15 minutes!

Need help? See `PRODUCTION_DEPLOYMENT.md` for detailed step-by-step instructions.
