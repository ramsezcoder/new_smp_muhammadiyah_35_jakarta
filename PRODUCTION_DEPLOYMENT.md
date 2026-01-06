# 🚀 PRODUCTION DEPLOYMENT GUIDE

**For: peachpuff-porcupine-369154.hostingersite.com**

---

## 🔴 Current Issues

Your production site has 2 issues:

1. **Admin page returns 404** - Backend server not running
2. **News API fails** - Backend server not running

**Root Cause:** The Node.js backend server is NOT running on your hosting.

---

## ✅ Solution: Deploy Backend Server

You have 3 options:

### **OPTION 1: Run Backend on Hostinger (Recommended if Hostinger supports Node.js)**

#### Step 1: SSH into your hosting
```bash
ssh user@peachpuff-porcupine-369154.hostingersite.com
```

#### Step 2: Navigate to project
```bash
cd /path/to/smp_muh_35_new/server
```

#### Step 3: Install & start
```bash
npm install
npm start
```

#### Step 4: Keep it running (use PM2)
```bash
npm install -g pm2
pm2 start index.js --name "smp-api"
pm2 startup
pm2 save
```

#### Step 5: Verify
```bash
curl http://localhost:3001/health
# Should respond: {"status":"ok",...}
```

---

### **OPTION 2: Deploy Backend to Separate Service (Easiest)**

Use a free service like **Heroku**, **Render**, or **Railway**:

#### For Render.com (Free):
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install && cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Environment:** `NODE_ENV=production`
5. Deploy!
6. Get your API URL (e.g., `https://smp-api-xyz.onrender.com`)

#### Update Frontend to Use New API URL

In `src/` directory, create `.env.production`:
```env
VITE_API_URL=https://smp-api-xyz.onrender.com
```

Then update API calls in your components:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '';

// News list
fetch(`${API_URL}/api/news/list?category=school&page=1`)

// Upload
fetch(`${API_URL}/api/upload/gallery`, { ... })
```

---

### **OPTION 3: Quick Test Locally First**

Before deploying, verify everything works:

```bash
# Terminal 1 - Backend
cd server
npm install
npm start
# Should see: ✓ Server running on port 3001

# Terminal 2 - Frontend
npm install
npm run build
npm run preview  # Serves built files

# Browser
Open http://localhost:3000/admin
# Should work now!
```

---

## 📋 Deployment Checklist

### Before Deploying
- [ ] Run `npm run build` locally - no errors?
- [ ] Test `/admin` route locally - works?
- [ ] Test `/api/news/list` locally - works?
- [ ] Test file upload locally - works?

### Deployment Steps
- [ ] Choose deployment method (Option 1, 2, or 3)
- [ ] Deploy backend server
- [ ] Update API URLs in frontend if needed
- [ ] Rebuild & deploy frontend
- [ ] Test all routes on production
- [ ] Check console for errors
- [ ] Verify APIs respond

### Post-Deployment Testing
```bash
# Test Admin Page
curl https://yourdomain.com/admin
# Should respond with HTML, not 404

# Test API
curl https://yourdomain.com:3001/api/news/list
# Or: https://yourdomain.com/api/news/list (if behind proxy)
# Should respond with JSON: {success: true, data: [...]}

# Test News Page
Visit https://yourdomain.com/news
# Should show news list (not fallback alert)

# Test Admin Upload
Login → Media Library → Try upload
# Should succeed with success toast
```

---

## 🔍 Diagnosis

### Check if Backend is Running
```bash
# On your server:
lsof -i :3001
# If nothing shows, backend is NOT running

# Or:
curl http://localhost:3001/health
# Should respond: {"status":"ok",...}
# If fails: backend not running
```

### Common Issues

**Issue:** "Connection refused on port 3001"  
**Solution:** Start the backend: `cd server && npm start`

**Issue:** "Admin page still 404"  
**Solution:** Frontend not using SPA fallback. Ensure:
- dist folder exists
- server.js serving dist/index.html for /* routes

**Issue:** "API returns 404"  
**Solution:** API endpoint not configured. Check:
- Backend running? `curl http://localhost:3001/api/news/list`
- API proxy configured? Check `vite.config.js`

---

## 📊 Architecture

### Current (What You Need)
```
┌─────────────────────────────────────┐
│  Frontend (React - Static HTML)     │
│  (Served by Hostinger/Render)       │
│  - /                                │
│  - /news                            │
│  - /gallery                         │
│  - /admin                           │
└──────────────┬──────────────────────┘
               │ /api/* calls
               │
┌──────────────▼──────────────────────┐
│  Backend (Node.js/Express - Server) │
│  (Must run on separate port 3001)   │
│  - GET /api/news/list               │
│  - POST /api/upload/gallery         │
│  - GET /api/pdf/views               │
└─────────────────────────────────────┘
```

---

## 🎯 Quick Decision Tree

**Can your hosting run Node.js?**
- ✅ **YES** → Use Option 1 (deploy on Hostinger)
- ❌ **NO** → Use Option 2 (deploy backend separately)

**How to check?**
1. Log into your Hostinger control panel
2. Look for "Node.js" or "Application" settings
3. If available → Use Option 1
4. If not → Use Option 2

---

## 📞 Support

### For Hostinger Hosting
Contact Hostinger support:
- Ask if they support Node.js applications
- Ask how to deploy a Node.js backend
- Ask how to keep processes running (PM2/Forever)

### For Render.com
Documentation: https://render.com/docs

### For Vercel/Netlify (Frontend Only)
If using these, deploy backend separately to Render/Heroku

---

## ✅ Verification After Deployment

Once deployed, verify with these commands:

```bash
# 1. Test Health Check
curl https://yourdomain.com/health
# Or: https://yourdomain.com:3001/health

# 2. Test News API
curl https://yourdomain.com/api/news/list?category=school
# Should return JSON with news articles

# 3. Test in Browser
Open https://yourdomain.com/news
# Should show news WITHOUT fallback alert

# 4. Test Admin
Open https://yourdomain.com/admin
# Should load admin dashboard, not 404

# 5. Test Upload
Login as SuperAdmin@2025
Go to Media Library
Upload image - should succeed
```

---

## 💡 Pro Tips

1. **Use PM2** for process management (keeps server running after crashes)
2. **Set up monitoring** (uptimerobot.com - free)
3. **Use environment variables** for secrets
4. **Enable CORS** for different domains
5. **Set up logging** for debugging production issues

---

**Status:** ⏳ Awaiting backend deployment  
**Next Step:** Choose Option 1 or 2 above and deploy

Let me know which option you choose and I'll help with specific steps!
