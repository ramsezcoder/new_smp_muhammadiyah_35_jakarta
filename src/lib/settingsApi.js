// Helper to get Authorization headers with Bearer token
function getHeaders() {
  const sessionStr = localStorage.getItem('app_session');
  const headers = { 'Content-Type': 'application/json' };
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    } catch (e) {
      console.error('Failed to parse session:', e);
    }
  }
  return headers;
}

export async function getSettings() {
  const res = await fetch('/api/settings/get.php', { 
    headers: getHeaders(),
    credentials: 'include' 
  });
  if (!res.ok) throw new Error(`Get settings failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Get settings failed');
  return json.data.settings || {};
}

export async function updateSettings(settings) {
  const res = await fetch('/api/settings/update.php', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(settings),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Update settings failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Update settings failed');
  return true;
}
