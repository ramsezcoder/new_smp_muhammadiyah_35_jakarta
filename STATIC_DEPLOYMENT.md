# Production Deployment Guide - Static Mode

## ✅ What's Ready

The site is now **100% static** and requires **NO backend server**. All data is bundled locally:

- ✅ News articles (39+ from WordPress + 3 defaults)
- ✅ PDF modules (E-modules list)
- ✅ Admin interface (CMS features disabled in static mode)
- ✅ All routes working (/, /news, /admin, /gallery, etc.)

## 🚀 Deployment Instructions

### Step 1: Build Locally
```bash
npm run build
```

This creates a `dist/` folder with everything needed.

### Step 2: Upload to Hostinger

1. **Connect to Hostinger** via FTP or File Manager
2. **Navigate** to your public_html folder
3. **Delete** old files (backup first!)
4. **Upload** contents of `dist/` folder:
   - index.html
   - assets/ folder (JS, CSS, images)
   - .htaccess (critical for SPA routing!)
   - favicon.ico

### Step 3: Verify Deployment

Test these URLs:
- ✅ `https://yourdomain.com/` - Homepage
- ✅ `https://yourdomain.com/news?category=school` - News page
- ✅ `https://yourdomain.com/admin` - Admin panel (should load, not 404)
- ✅ `https://yourdomain.com/gallery` - Gallery
- ✅ Click any news article - should open detail page

## ⚠️ Important Files

**`.htaccess`** - MUST be uploaded to enable SPA routing
- Without this: `/admin` and other routes return 404
- With this: All routes work correctly

**`src/data/` JSON files** - Bundled in dist/assets/
- `importedPosts.json` - WordPress articles
- `news.school.json` - School news fallback
- `news.student.json` - Student news fallback
- `pdf.json` - E-module data

## 🔧 How Static Fallback Works

1. **Browser requests** `/api/news/list`
2. **Static hosting** returns 404 (no backend)
3. **JavaScript** catches error → uses `src/data/news.school.json`
4. **UI shows** articles from local data
5. **Console shows**: `[news] API failed, using static data` (expected!)

## 🛠️ Troubleshooting

### Admin page still shows 404?
- ✅ Upload `.htaccess` to public_html root
- ✅ Enable mod_rewrite on Hostinger (usually default)
- ✅ Clear browser cache (Ctrl+Shift+Del)

### No news articles showing?
- ✅ Check console for errors: F12 → Console tab
- ✅ Verify `src/data/news.school.json` exists in `dist/`
- ✅ Try a hard refresh: Ctrl+Shift+R

### reCAPTCHA warning?
- ✅ This is non-blocking (doesn't break site)
- ✅ Add RECAPTCHA_SITE_KEY to `.env` if desired
- ✅ Site works fine without it

### Images not loading?
- ✅ Check image URLs in news articles
- ✅ External URLs (Unsplash) should work
- ✅ Local images should be in `public/` folder

## 📱 Features in Static Mode

### ✅ Working
- View all news articles
- Read article details
- Browse galleries
- Access admin dashboard
- View E-modules (PDF list)
- Student registration form
- Contact form
- SEO metadata
- Mobile responsive design

### ⚠️ Limited (Silent Failures)
- Gallery upload (uploads to browser localStorage, doesn't persist after logout)
- PDF view count tracking (counts locally, not saved to server)
- Admin actions (show as "static mode" messages)

## 🔄 To Add Backend Later

If you deploy a Node.js backend in future:

1. Update API URLs in `src/lib/fetchWithFallback.js`
2. Backend will automatically be used instead of fallback
3. No UI changes needed - fallback is transparent

## 📝 Production Checklist

- [ ] Built locally: `npm run build`
- [ ] Tested locally: `npm run preview`
- [ ] `.htaccess` uploaded to public_html root
- [ ] All files from `dist/` uploaded
- [ ] Homepage loads: `https://domain.com`
- [ ] Admin loads: `https://domain.com/admin`
- [ ] News loads: `https://domain.com/news`
- [ ] Article detail works: click any news card
- [ ] Browser console has no fatal errors

## 🎉 You're Done!

Site is live and working **100% statically**. No server maintenance needed!
