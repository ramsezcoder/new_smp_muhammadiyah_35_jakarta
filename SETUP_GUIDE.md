# Environment Variables Configuration

## Required Environment Variables

To enable all features of the SMP Muhammadiyah 35 Jakarta website, add these environment variables:

### Google reCAPTCHA v3

**Frontend (.env):**
```bash
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
VITE_RECAPTCHA_API_URL=https://your-backend-domain.com/api/verify-recaptcha
```

**Backend (server/.env):**
```bash
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
ALLOWED_ORIGINS=https://peachpuff-porcupine-369154.hostingersite.com
```

**How to get reCAPTCHA keys:**

1. Go to https://www.google.com/recaptcha/admin
2. Register your site with reCAPTCHA v3
3. Add your domain: `peachpuff-porcupine-369154.hostingersite.com`
4. Add localhost for testing: `localhost`
5. Copy Site Key → paste in `VITE_RECAPTCHA_SITE_KEY`
6. Copy Secret Key → paste in `VITE_RECAPTCHA_SECRET`

**Important Notes:**

- The `VITE_RECAPTCHA_SITE_KEY` is safe to use in frontend code (it's public)
- The `RECAPTCHA_SECRET_KEY` must NEVER be in frontend code - only in backend `server/.env`
- For static hosting without backend: verification falls back to client-side (still has honeypot + rate limit)
- For production security: deploy the backend server from `server/` folder
- Backend endpoint: `/api/verify-recaptcha` verifies tokens server-side with proper secret key

## Deployment Instructions

### For Static Hosting (Hostinger / cPanel):

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder contents to `public_html/smpmuh/`

3. Upload `.htaccess` file to `public_html/smpmuh/`

4. Set environment variable `VITE_RECAPTCHA_SITE_KEY` in `.env.production`

5. **Optional Backend (Recommended for Security):**
   - Upload `server/` folder to your hosting
   - Install dependencies: `cd server && npm install --production`
   - Configure `server/.env` with `RECAPTCHA_SECRET_KEY`
   - Start backend: `npm start` (or use PM2)
   - Update frontend `.env`: `VITE_RECAPTCHA_API_URL=https://your-api-domain.com/api/verify-recaptcha`
   - Rebuild frontend: `npm run build`

### For Hosting with Serverless Functions:

If your hosting supports serverless functions (Vercel, Netlify, etc.):

1. Deploy backend as serverless function (see `api/verify-recaptcha.js` template)
2. Ensure `RECAPTCHA_SECRET_KEY` is set in hosting environment variables
3. Update frontend `.env`: `VITE_RECAPTCHA_API_URL=/api/verify-recaptcha`
4. Build and deploy normally

## Testing

### Local Development:

```bash
npm run dev
```

Test registration form at http://localhost:3000/#registration

### Production Testing:

1. Test registration form submission
2. Verify reCAPTCHA loads without errors
3. Check console for any reCAPTCHA warnings
4. Test article slugs: `#article-{slug}` instead of `#article-{id}`
5. Verify Open Graph meta tags in browser dev tools

## SEO Features

### Automatic Slug Generation

- Slugs are auto-generated from article titles
- Indonesian stopwords are removed
- Max 8-10 words
- Example: "EMC 2025 Edusversal Mathematics Competition" → "emc-2025-edusversal-mathematics"

### Meta Description AI

- Auto-generates 150-160 character descriptions
- Includes focus keyphrase
- Human-readable summary format
- School name mentioned automatically

### SEO Title Format

- Format: `{Main Topic} | SMP Muhammadiyah 35 Jakarta`
- Max 60 characters for main topic
- Optimized for Google search results

### LSI Keywords

- Extracts 5 most relevant keywords from content
- Used for internal SEO scoring
- Helps with semantic search optimization

### CTR Score

- Calculates click-through-rate probability (0-100)
- Based on: title length, power words, numbers, clarity
- Score displayed in admin CMS (not shown to users)

## Security Enhancements

1. **Input Sanitization**: All form inputs sanitized before storage
2. **Honeypot Field**: Hidden field to catch bots
3. **Rate Limiting**: 60-second cooldown between submissions
4. **Phone Validation**: 10-15 digits only
5. **reCAPTCHA v3**: Invisible bot protection (score threshold: 0.5)

## Article Routing

### Old Format (Deprecated):
```
#article-1767640282811
```

### New Format (Current):
```
#article-emc-2025-edusversal-mathematics
```

Both formats are supported for backward compatibility.

## Open Graph Preview

When sharing articles on social media, the following metadata is included:

- `og:title`: SEO-optimized title
- `og:description`: Meta description
- `og:image`: Featured image
- `og:url`: Canonical URL with slug
- `og:type`: article
- `twitter:card`: summary_large_image

Test with:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- WhatsApp: Send link to yourself and check preview

## File Structure

```
├── server/                        # Backend API (Node.js + Express)
│   ├── api/
│   │   └── verify-recaptcha.js    # reCAPTCHA verification endpoint
│   ├── index.js                   # Express server entry point
│   ├── package.json               # Backend dependencies
│   ├── .env.example               # Backend env template
│   └── README.md                  # Backend documentation
├── src/
│   ├── lib/
│   │   ├── recaptcha.js           # Frontend reCAPTCHA integration
│   │   ├── seo-engine.js          # SEO AI utilities
│   │   ├── seo-utils.js           # Existing SEO helpers
│   │   └── db.js                  # LocalStorage database
│   ├── utils/
│   │   └── sanitize.js            # Input sanitization
│   ├── components/
│   │   ├── RegistrationSection.jsx  # Form with reCAPTCHA + security
│   │   ├── ArticleDetail.jsx        # Article view with OG tags
│   │   ├── NewsSection.jsx          # News listing with slug links
│   │   └── admin/
│   │       └── NewsManager.jsx      # CMS with SEO AI engine
│   └── App.jsx                      # Routing with slug support
├── .env.example                     # Frontend env template
└── SETUP_GUIDE.md                   # This file
```

## Troubleshooting

### reCAPTCHA "Verifikasi gagal" Error:

1. **Check Site Key**: Verify `VITE_RECAPTCHA_SITE_KEY` is correct in frontend `.env`
2. **Domain Registration**: Ensure domain is registered in Google reCAPTCHA admin console
3. **Backend Connection**: 
   - If using backend: verify `VITE_RECAPTCHA_API_URL` points to correct endpoint
   - Test backend: `curl -X POST http://your-api/api/verify-recaptcha -H "Content-Type: application/json" -d '{"token":"test"}'`
   - Check backend logs for errors
4. **Secret Key**: Verify `RECAPTCHA_SECRET_KEY` is set in backend `server/.env` (NOT frontend)
5. **Fallback Mode**: Without backend, client-side validation will be used (less secure but still has honeypot + rate limit)

### Backend API Issues:

1. **Cannot connect to backend**:
   - Verify backend server is running: `cd server && npm start`
   - Check CORS settings in `server/index.js`
   - Ensure `ALLOWED_ORIGINS` includes your frontend domain
   - Test health endpoint: `curl http://localhost:3001/health`

2. **"RECAPTCHA_SECRET_KEY not configured"**:
   - Create `server/.env` from `server/.env.example`
   - Add your actual Google secret key
   - Restart backend server

3. **CORS blocked**:
   - Add frontend URL to `ALLOWED_ORIGINS` in `server/.env`
   - Format: `https://domain.com` (no trailing slash)
   - Restart backend after changing .env

### Slugs Not Working:

1. Clear localStorage and create new article
2. Check that article has `seo.slug` or `slug` field
3. Verify `generateSlug()` is being called in NewsManager
4. Check browser URL: should be `#article-{slug}` not `#article-{id}`

### SEO Metadata Not Showing:

1. Check Helmet is rendering in ArticleDetail
2. View page source (not dev tools) to see meta tags
3. Use browser extension like "META SEO inspector"
4. Test Open Graph with Facebook Sharing Debugger

### Build Errors:

```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build
```

## Support

For issues or questions:
- Check browser console for errors
- Review `SECURITY_REQUIREMENTS.md` for security guidelines
- Test in incognito mode to rule out browser extensions
- Verify environment variables are set correctly
