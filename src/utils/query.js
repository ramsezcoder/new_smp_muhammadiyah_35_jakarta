export const getQueryParam = (params, key, fallback = '') => {
  const value = params.get(key);
  return value !== null && value !== undefined && value !== '' ? value : fallback;
};

export const getIntParam = (params, key, fallback = 1) => {
  const raw = params.get(key);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getCategoryParam = (params, allowed = ['school', 'student'], fallback = 'school') => {
  const raw = params.get('category');
  if (!raw) return fallback;
  return allowed.includes(raw) ? raw : fallback;
};
