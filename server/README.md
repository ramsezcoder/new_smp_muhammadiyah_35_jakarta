# SMP Muhammadiyah 35 Jakarta - Backend API

Secure backend server for handling reCAPTCHA v3 verification.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your secret keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
RECAPTCHA_SECRET_KEY=your_actual_secret_key_from_google
PORT=3001
ALLOWED_ORIGINS=https://peachpuff-porcupine-369154.hostingersite.com
```

**⚠️ SECURITY WARNING:**
- Never commit `.env` to version control
- Never share your secret key
- Keep `.env` in `.gitignore`

### 3. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### POST /api/verify-recaptcha

Verifies Google reCAPTCHA v3 token.

**Request:**
```json
POST /api/verify-recaptcha
Content-Type: application/json

{
  "token": "03AGdBq27..."
}
```

**Success Response:**
```json
{
  "success": true,
  "score": 0.9,
  "action": "registration_submit"
}
```

**Failure Response:**
```json
{
  "success": false,
  "score": 0.3,
  "action": "registration_submit"
}
```

**Error Response:**
```json
{
  "success": false,
  "score": 0,
  "error": "Missing or invalid token"
}
```

## Deployment

### Hostinger Node.js App

1. **Upload Files:**
   - Upload `server/` folder to your hosting
   - Ensure `node_modules/` is excluded (will install on server)

2. **Set Environment Variables:**
   - In Hostinger control panel, go to Node.js App settings
   - Add environment variables:
     - `RECAPTCHA_SECRET_KEY`: Your Google secret key
     - `NODE_ENV`: `production`
     - `ALLOWED_ORIGINS`: Your domain

3. **Install Dependencies:**
   ```bash
   npm install --production
   ```

4. **Start Server:**
   ```bash
   npm start
   ```

5. **Update Frontend:**
   Edit `src/lib/recaptcha.js` to use production API:
   ```javascript
   const API_URL = 'https://your-backend-domain.com/api/verify-recaptcha';
   ```

### Other Hosting Providers

#### Vercel/Netlify:
- Use serverless functions (already have `/api/verify-recaptcha.js` template)
- Set environment variables in hosting dashboard

#### VPS/Cloud:
- Install Node.js 16+
- Use PM2 for process management:
  ```bash
  npm install -g pm2
  pm2 start index.js --name smpmuh35-api
  pm2 save
  pm2 startup
  ```

## Security Features

✅ Secret key stored in environment variables only
✅ CORS protection with whitelist
✅ Content-Type validation
✅ Request body validation
✅ Error handling without data leaks
✅ No caching on API routes
✅ Security headers (X-Frame-Options, CSP, etc.)
✅ Score threshold enforcement (0.5 minimum)
✅ Suspicious activity logging

## Troubleshooting

### Error: "RECAPTCHA_SECRET_KEY not configured"
- Ensure `.env` file exists in `server/` directory
- Check that `RECAPTCHA_SECRET_KEY` is set
- Restart server after changing `.env`

### Error: "CORS policy blocked"
- Add your frontend domain to `ALLOWED_ORIGINS` in `.env`
- Format: `https://your-domain.com` (no trailing slash)

### Error: "Verification failed"
- Check Google reCAPTCHA admin console
- Verify domain is registered
- Ensure site key and secret key match

### Low reCAPTCHA Scores:
- Test in incognito mode
- Check for bot-like behavior (rapid submissions)
- Review Google reCAPTCHA analytics dashboard

## Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T10:30:00.000Z"
}
```

## Support

For issues:
1. Check logs: `console.error` outputs in terminal
2. Test with curl/Postman before frontend integration
3. Verify environment variables are loaded
4. Check Google reCAPTCHA admin console for errors
