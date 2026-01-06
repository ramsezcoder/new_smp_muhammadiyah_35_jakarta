#!/usr/bin/env node

/**
 * Production Troubleshooting Checker
 * Run: node troubleshoot.js
 */

const http = require('http');
const https = require('https');

const config = {
  domain: process.env.DOMAIN || 'peachpuff-porcupine-369154.hostingersite.com',
  apiPort: process.env.API_PORT || 3001,
  local: process.env.LOCAL === 'true',
};

const tests = [];

function log(level, message) {
  const icons = {
    error: '❌',
    warn: '⚠️',
    success: '✅',
    info: 'ℹ️',
    test: '🧪',
  };
  console.log(`${icons[level] || level} ${message}`);
}

function testApi(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeoutId = setTimeout(() => {
      log('error', `${name}: TIMEOUT (no response in 5s)`);
      resolve(false);
    }, 5000);

    protocol.get(url, (res) => {
      clearTimeout(timeoutId);
      if (res.statusCode === 200) {
        log('success', `${name}: Responded ${res.statusCode}`);
        resolve(true);
      } else {
        log('error', `${name}: Responded ${res.statusCode} (expected 200)`);
        resolve(false);
      }
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      log('error', `${name}: ${err.message}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Production Troubleshooting Checker    ║');
  console.log('╚════════════════════════════════════════╝\n');

  if (config.local) {
    console.log('📍 Testing LOCAL environment\n');

    // Test local backend
    console.log('Testing Backend (localhost:3001)...');
    const backendOk = await testApi('http://localhost:3001/health', 'Backend Health Check');
    if (backendOk) {
      await testApi('http://localhost:3001/api/news/list', 'Backend API');
    }

    // Test local frontend
    console.log('\nTesting Frontend (localhost:3000)...');
    await testApi('http://localhost:3000/', 'Frontend Health');
  } else {
    console.log(`📍 Testing PRODUCTION: ${config.domain}\n`);

    // Test frontend
    console.log('Testing Frontend...');
    const frontendOk = await testApi(`https://${config.domain}/`, 'Frontend');

    // Test admin page
    console.log('\nTesting Admin Page...');
    const adminOk = await testApi(`https://${config.domain}/admin`, 'Admin Page');
    if (!adminOk) {
      log('error', 'Admin returns 404 - Backend server likely not running');
    }

    // Test backend on same domain
    console.log('\nTesting Backend...');
    const backendSameDomain = await testApi(
      `https://${config.domain}:${config.apiPort}/health`,
      `Backend (${config.domain}:${config.apiPort})`
    );

    if (!backendSameDomain) {
      log('info', 'Backend not on same domain. Checking separate domains...');
      // User might have deployed to different server
      log('info', 'If backend is on different domain, update VITE_API_URL');
    }

    // Test API
    if (backendSameDomain) {
      console.log('\nTesting API Endpoints...');
      await testApi(`https://${config.domain}:${config.apiPort}/api/news/list`, 'News API');
      await testApi(`https://${config.domain}:${config.apiPort}/api/pdf/views`, 'PDF Views API');
    }
  }

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Diagnosis & Next Steps                ║');
  console.log('╚════════════════════════════════════════╝\n');

  log('info', 'See PRODUCTION_DEPLOYMENT.md for solutions');
  log('info', 'Options:');
  log('info', '  1. Deploy backend to same server');
  log('info', '  2. Deploy backend to separate service (Render/Heroku)');
  log('info', '  3. Use serverless functions (Lambda/Vercel)');
}

// Run tests
runTests().catch(err => {
  log('error', `Checker failed: ${err.message}`);
  process.exit(1);
});
