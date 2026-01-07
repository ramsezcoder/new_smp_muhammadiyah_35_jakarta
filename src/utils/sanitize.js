// Security: centralized input sanitization helpers
export function sanitizeInput(v) {
  if (v === undefined || v === null) return '';
  return v
    .toString()
    .normalize('NFKC')
    .replace(/script/gi, '')
    .replace(/[<>/{}$%^*;()=+`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

export function sanitizePhone(v) {
  if (!v) return '';
  const digits = v.toString().replace(/\D+/g, '').slice(0, 15);
  return digits;
}

export function isValidPhone(v) {
  const digits = sanitizePhone(v);
  return digits.length >= 10 && digits.length <= 15;
}
