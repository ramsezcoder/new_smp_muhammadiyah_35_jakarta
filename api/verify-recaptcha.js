const SECRET = process.env.VITE_RECAPTCHA_SECRET;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { token } = body;

    if (!SECRET) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, score: 0, error: 'Missing secret' }));
      return;
    }

    if (!token) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, score: 0 }));
      return;
    }

    const params = new URLSearchParams();
    params.append('secret', SECRET);
    params.append('response', token);

    const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await googleResponse.json();
    const score = typeof data.score === 'number' ? data.score : 0;
    const isValid = data.success === true && score >= 0.5;

    if (!isValid) {
      console.warn('Suspicious bot detected during registration', {
        score,
        action: data.action,
        errors: data['error-codes'] || [],
      });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: isValid,
      score,
      action: data.action,
    }));
  } catch (error) {
    console.error('reCAPTCHA verification error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, score: 0 }));
  }
};
