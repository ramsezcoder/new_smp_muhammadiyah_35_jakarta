# SMP Muhammadiyah 35 Jakarta - Official Website

Modern, secure, and SEO-optimized school website built with React + Vite + Tailwind CSS.

## 🚀 Quick Start

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend API (Optional but Recommended)

For secure reCAPTCHA verification:

```bash
# Windows
start-backend.bat

# Linux/Mac
chmod +x start-backend.sh
./start-backend.sh
```

Or manually:

```bash
cd server
npm install
cp .env.example .env
# Edit .env and add RECAPTCHA_SECRET_KEY
npm start
```

## 📋 Features

### Security
- ✅ Google reCAPTCHA v3 bot protection
- ✅ Input sanitization (XSS prevention)
- ✅ Honeypot spam detection
- ✅ Rate limiting (60s cooldown)
- ✅ Phone number validation
- ✅ CORS protection
- ✅ Secure backend API for token verification

### SEO & Content
- ✅ AI-powered slug generation
- ✅ Auto meta descriptions (150-160 chars)
- ✅ LSI keyword extraction
- ✅ CTR score calculator
- ✅ Open Graph tags
- ✅ Twitter Card metadata
- ✅ Schema.org structured data
- ✅ Sitemap ready

### CMS Features
- ✅ Rich text editor
- ✅ Featured images
- ✅ Hashtag support
- ✅ SEO preview
- ✅ Draft/Publish workflow
- ✅ Multiple channels (School/Student)
- ✅ CSV export
- ✅ Readability scoring

### Frontend
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations (Framer Motion)
- ✅ Lazy loading images
- ✅ Optimized performance
- ✅ Dark mode ready
- ✅ Accessible (WCAG compliant)

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_RECAPTCHA_SITE_KEY=your_site_key
VITE_RECAPTCHA_API_URL=https://api.yoursite.com/api/verify-recaptcha
```

**Backend (server/.env):**
```bash
RECAPTCHA_SECRET_KEY=your_secret_key
ALLOWED_ORIGINS=https://yoursite.com
PORT=3001
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── lib/              # Utilities (SEO, reCAPTCHA, DB)
│   └── utils/            # Helper functions
├── server/                # Backend API
│   ├── api/              # API endpoints
│   ├── index.js          # Express server
│   └── package.json      # Backend dependencies
├── public/               # Static assets
└── dist/                 # Production build
```

## 🚢 Deployment

### Hostinger / cPanel

1. Build: `npm run build`
2. Upload `dist/` → `public_html/smpmuh/`
3. Upload `.htaccess` → `public_html/smpmuh/`
4. (Optional) Deploy backend from `server/` folder

### Vercel / Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy serverless functions from `api/`

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed deployment steps.

## 🔒 Security

**CRITICAL: Never commit secrets to version control!**

- ❌ DO NOT commit `.env` files
- ❌ DO NOT hardcode API keys
- ❌ DO NOT expose `RECAPTCHA_SECRET_KEY` in frontend
- ✅ DO use environment variables
- ✅ DO keep `.env` in `.gitignore`
- ✅ DO rotate keys if exposed

See [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) for security guidelines.

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Installation & configuration
- [Security Requirements](SECURITY_REQUIREMENTS.md) - Security best practices
- [Backend API](server/README.md) - Backend documentation

## 🧪 Testing

### Manual Testing Checklist

- [ ] Registration form submits successfully
- [ ] reCAPTCHA loads without errors
- [ ] Phone validation works (10-15 digits)
- [ ] Rate limiting blocks rapid submissions
- [ ] Article slugs work in URLs
- [ ] SEO meta tags render correctly
- [ ] Open Graph preview works (Facebook/WhatsApp)
- [ ] Mobile responsive design
- [ ] All navigation links work
- [ ] Admin dashboard accessible

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Animation**: Framer Motion
- **Forms**: React Hook Form
- **SEO**: React Helmet
- **Icons**: Lucide React
- **Security**: Google reCAPTCHA v3

## 📝 License

© 2026 SMP Muhammadiyah 35 Jakarta. All rights reserved.

## 🤝 Support

For issues or questions:
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section
- Review browser console for errors
- Test backend health: `http://localhost:3001/health`
- Verify environment variables are set

---

**Made with ❤️ for SMP Muhammadiyah 35 Jakarta**
