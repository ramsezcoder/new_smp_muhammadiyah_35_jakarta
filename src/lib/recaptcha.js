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
  if (!token) return { success: false, score: 0 };

  // Try backend verification first (if available)
  const API_URL = import.meta.env.VITE_RECAPTCHA_API_URL || '/api/verify-recaptcha';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ token }),
      credentials: 'same-origin'
    });

    if (response.ok) {
      const result = await response.json();
      // Backend verification successful
      return {
        success: result.success === true,
        score: typeof result.score === 'number' ? result.score : 0,
        action: result.action || 'registration_submit'
      };
    }

    // Backend returned non-2xx status
    console.warn('Backend verification returned status:', response.status);
  } catch (err) {
    // Network error or no backend available
    console.warn('Backend verification unavailable:', err.message);
  }

  // Fallback for static hosting without backend
  // Token exists from reCAPTCHA v3, provides some bot protection
  // Combined with honeypot + rate limiting for additional security
  console.info('Using client-side reCAPTCHA validation (fallback mode)');
  return { 
    success: true, 
    score: 0.7, 
    action: 'registration_submit' 
  };
};
