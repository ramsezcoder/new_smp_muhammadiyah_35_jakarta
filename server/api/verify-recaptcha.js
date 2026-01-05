const express = require('express');
const router = express.Router();

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
  try {
    // Validate request content type
    if (!req.is('application/json')) {
      return res.status(415).json({
        success: false,
        score: 0,
        error: 'Content-Type must be application/json'
      });
    }

    // Extract token from request body
    const { token } = req.body;

    // Validate token exists
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({
        success: false,
        score: 0,
        error: 'Missing or invalid token'
      });
    }

    // Get secret key from environment (NEVER hardcode)
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured in environment');
      return res.status(500).json({
        success: false,
        score: 0,
        error: 'Server configuration error'
      });
    }

    // Prepare request to Google's siteverify API
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    
    // Optional: Add remote IP for additional validation
    if (req.ip) {
      params.append('remoteip', req.ip);
    }

    // Send verification request to Google
    const googleResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Check if Google API responded
    if (!googleResponse.ok) {
      console.error('Google reCAPTCHA API error:', googleResponse.status);
      return res.status(500).json({
        success: false,
        score: 0,
        error: 'Verification service unavailable'
      });
    }

    // Parse Google's response
    const data = await googleResponse.json();

    // Extract verification details
    const isSuccess = data.success === true;
    const score = typeof data.score === 'number' ? data.score : 0;
    const action = data.action || '';
    const hostname = data.hostname || '';
    const challengeTs = data.challenge_ts || '';

    // Apply score threshold (0.5 minimum for legitimate users)
    const SCORE_THRESHOLD = 0.5;
    const isValid = isSuccess && score >= SCORE_THRESHOLD;

    // Log suspicious activity (without exposing secrets)
    if (!isValid) {
      console.warn('Suspicious reCAPTCHA attempt blocked', {
        score,
        action,
        hostname,
        timestamp: challengeTs,
        ip: req.ip,
        errors: data['error-codes'] || []
      });
    }

    // Return clean response to client (no Google raw data)
    return res.status(200).json({
      success: isValid,
      score: score,
      action: action
    });

  } catch (error) {
    // Log error safely (no secret exposure)
    console.error('reCAPTCHA verification error:', error.message);
    
    // Return generic error to client
    return res.status(500).json({
      success: false,
      score: 0,
      error: 'Verification failed'
    });
  }
});

module.exports = router;
