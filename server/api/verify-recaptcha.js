const express = require('express');
const https = require('https');
const router = express.Router();

const isDev = process.env.NODE_ENV !== 'production';

/**
 * POST /api/verify-recaptcha
 * Verifies Google reCAPTCHA v3 token against Google's API
 * 
 * Security:
 * - Secret key never exposed to client
 * - Token validation with score threshold
 * - Error handling without leaking sensitive data
 */
router.post('/verify-recaptcha', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request content type
    if (!req.is('application/json')) {
      if (isDev) console.log('[reCAPTCHA] Invalid content-type');
      return res.status(415).json({
        success: false,
        score: 0,
        error: 'Content-Type must be application/json'
      });
    }

    // Extract token from request body
    const { token } = req.body;

    // Debug: Log token received (safe - only length)
    if (isDev) {
      console.log('[reCAPTCHA] Token received, length:', token ? token.length : 0);
    }

    // Validate token exists
    if (!token || typeof token !== 'string' || token.trim() === '') {
      if (isDev) console.log('[reCAPTCHA] Token missing or invalid');
      return res.status(400).json({
        success: false,
        score: 0,
        error: 'Missing or invalid token'
      });
    }

    // Get secret key from environment (NEVER hardcode)
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('[reCAPTCHA] RECAPTCHA_SECRET_KEY not configured in environment');
      return res.status(500).json({
        success: false,
        score: 0,
        error: 'Server configuration error'
      });
    }

    if (isDev) {
      console.log('[reCAPTCHA] Secret key loaded, length:', secretKey.length);
    }

    // Prepare request to Google's siteverify API
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    
    // Optional: Add remote IP for additional validation
    const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    if (clientIp) {
      params.append('remoteip', clientIp);
      if (isDev) console.log('[reCAPTCHA] Client IP:', clientIp);
    }

    // Debug: Log request payload (without secret)
    if (isDev) {
      console.log('[reCAPTCHA] Calling Google API with:', {
        url: verifyUrl,
        tokenLength: token.length,
        hasRemoteIp: !!clientIp
      });
    }

    // Send verification request to Google using native https module for compatibility
    const googleResponse = await new Promise((resolve, reject) => {
      const postData = params.toString();
      const options = {
        hostname: 'www.google.com',
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000 // 10 second timeout
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ ok: res.statusCode === 200, json: () => JSON.parse(data) });
          } catch (e) {
            reject(new Error('Invalid JSON from Google'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Google API timeout'));
      });

      req.write(postData);
      req.end();
    });

    // Check if Google API responded
    if (!googleResponse.ok) {
      console.error('[reCAPTCHA] Google API returned non-200 status');
      return res.status(500).json({
        success: false,
        score: 0,
        error: 'Verification service unavailable'
      });
    }

    // Parse Google's response
    const data = await googleResponse.json();

    // Debug: Log Google response (safe - no secrets)
    if (isDev) {
      console.log('[reCAPTCHA] Google response:', {
        success: data.success,
        score: data.score,
        action: data.action,
        hostname: data.hostname,
        challenge_ts: data.challenge_ts,
        'error-codes': data['error-codes'],
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Extract verification details
    const isSuccess = data.success === true;
    const score = typeof data.score === 'number' ? data.score : 0;
    const action = data.action || '';
    const hostname = data.hostname || '';
    const challengeTs = data.challenge_ts || '';
    const errorCodes = data['error-codes'] || [];

    // Apply score threshold (0.5 minimum for legitimate users)
    const SCORE_THRESHOLD = 0.5;
    const isValid = isSuccess && score >= SCORE_THRESHOLD;

    // Log all attempts in dev, only suspicious in production
    if (isDev || !isValid) {
      const logLevel = isValid ? 'log' : 'warn';
      console[logLevel](`[reCAPTCHA] Verification ${isValid ? 'passed' : 'failed'}:`, {
        success: isSuccess,
        score,
        action,
        hostname,
        timestamp: challengeTs,
        ip: clientIp,
        errors: errorCodes,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Return clean response to client (no Google raw data)
    return res.status(200).json({
      success: isValid,
      score: score,
      action: action,
      ...(errorCodes.length > 0 && { errors: errorCodes })
    });

  } catch (error) {
    // Log error safely (no secret exposure)
    console.error('[reCAPTCHA] Verification error:', {
      message: error.message,
      stack: isDev ? error.stack : undefined,
      responseTime: `${Date.now() - startTime}ms`
    });
    
    // Return generic error to client
    return res.status(500).json({
      success: false,
      score: 0,
      error: isDev ? error.message : 'Verification failed'
    });
  }
});

module.exports = router;
