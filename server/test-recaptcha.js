const https = require('https');
require('dotenv').config();

console.log('==============================================');
console.log('reCAPTCHA Backend Test Script');
console.log('==============================================\n');

// Check environment variables
const secretKey = process.env.RECAPTCHA_SECRET_KEY;

if (!secretKey) {
  console.error('❌ RECAPTCHA_SECRET_KEY not found in .env file');
  console.error('   Please add it to server/.env');
  process.exit(1);
}

console.log('✅ Secret key loaded:', secretKey.substring(0, 10) + '...');
console.log('   Length:', secretKey.length);
console.log('');

// Test with a dummy token (will fail but shows connection works)
const testToken = 'test_token_for_debugging';

console.log('Testing Google API connection...');
console.log('Token:', testToken);
console.log('');

const params = new URLSearchParams();
params.append('secret', secretKey);
params.append('response', testToken);

const postData = params.toString();
const options = {
  hostname: 'www.google.com',
  path: '/recaptcha/api/siteverify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log('✅ Connected to Google API');
  console.log('   Status:', res.statusCode);
  console.log('');
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📦 Google Response:');
      console.log(JSON.stringify(result, null, 2));
      console.log('');
      
      if (result.success === false && result['error-codes']) {
        console.log('⚠️  Errors (expected for test token):');
        result['error-codes'].forEach(code => {
          console.log('   -', code);
        });
      }
      
      console.log('');
      console.log('==============================================');
      console.log('✅ Backend can connect to Google API!');
      console.log('   Now test with a real token from frontend.');
      console.log('==============================================');
    } catch (e) {
      console.error('❌ Invalid JSON response:', e.message);
      console.error('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.error('');
  console.error('Possible issues:');
  console.error('- No internet connection');
  console.error('- Firewall blocking HTTPS');
  console.error('- Google API down (unlikely)');
});

req.on('timeout', () => {
  req.destroy();
  console.error('❌ Request timeout (10s exceeded)');
});

req.write(postData);
req.end();
