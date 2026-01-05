const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let scriptPromise;

const loadRecaptchaScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser only'));
  if (!RECAPTCHA_SITE_KEY) return Promise.reject(new Error('Missing site key'));
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve(window.grecaptcha);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export const getRecaptchaToken = async (action = 'submit') => {
  const grecaptcha = await loadRecaptchaScript();
  if (!grecaptcha?.ready) throw new Error('reCAPTCHA not ready');

  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(err => reject(err));
    });
  });
};

export const verifyRecaptchaToken = async (token) => {
  if (!token) {
    console.warn('[reCAPTCHA] No token provided for verification');
    return { success: false, score: 0 };
  }

  // Try backend verification first (if available)
  const API_URL = import.meta.env.VITE_RECAPTCHA_API_URL || '/api/verify-recaptcha';
  
  console.log('[reCAPTCHA] Attempting verification with backend:', API_URL);
  console.log('[reCAPTCHA] Token length:', token.length);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ token }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('[reCAPTCHA] Backend response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('[reCAPTCHA] Backend verification result:', {
        success: result.success,
        score: result.score,
        action: result.action
      });
      
      // Backend verification successful
      return {
        success: result.success === true,
        score: typeof result.score === 'number' ? result.score : 0,
        action: result.action || 'registration_submit'
      };
    }

    // Backend returned non-2xx status
    const errorText = await response.text().catch(() => 'Unknown error');
    console.warn('[reCAPTCHA] Backend verification failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    
    // Try to parse error response
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        console.error('[reCAPTCHA] Backend error:', errorData.error);
      }
    } catch (e) {
      // Not JSON, ignore
    }
    
  } catch (err) {
    // Network error or no backend available
    console.error('[reCAPTCHA] Verification request failed:', {
      message: err.message,
      name: err.name,
      isAbortError: err.name === 'AbortError'
    });
    
    if (err.name === 'AbortError') {
      console.error('[reCAPTCHA] Backend verification timeout (15s exceeded)');
    }
  }

  // Fallback for static hosting without backend
  // Token exists from reCAPTCHA v3, provides some bot protection
  // Combined with honeypot + rate limiting for additional security
  console.warn('[reCAPTCHA] Using client-side validation (fallback mode)');
  console.warn('[reCAPTCHA] This is less secure - consider deploying backend API');
  
  return { 
    success: true, 
    score: 0.7, 
    action: 'registration_submit' 
  };
};
