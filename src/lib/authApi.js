export async function apiLogin(email, password) {
  const res = await fetch('/api/auth/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Login failed');
  return json.data;
}

export async function apiVerify(token) {
  const res = await fetch('/api/auth/verify.php', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.success ? json.data.user : null;
}
