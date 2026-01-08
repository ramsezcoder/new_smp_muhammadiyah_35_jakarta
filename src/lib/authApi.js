import { assertApiOk } from '@/lib/utils';

export async function apiLogin(email, password) {
  const res = await fetch('/api/auth/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  const json = await assertApiOk(res, 'Login failed');
  return json.data;
}

export async function apiVerify(token) {
  const res = await fetch('/api/auth/verify.php', { 
    headers: { Authorization: `Bearer ${token}` }, 
    credentials: 'include' 
  });
  if (!res.ok) {
    // Explicitly fail-closed on non-200; throw for 401/403 to trigger logout
    const status = res.status;
    if (status === 401 || status === 403) {
      throw new Error('Unauthorized');
    }
    return null;
  }
  const json = await res.json();
  return json.success ? json.data.user : null;
}

export async function apiLogout(token) {
  try {
    const res = await fetch('/api/auth/logout.php', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
}
