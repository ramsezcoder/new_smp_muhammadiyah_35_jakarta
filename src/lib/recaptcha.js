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

  const response = await fetch('/api/verify-recaptcha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    return { success: false, score: 0 };
  }

  return response.json();
};
