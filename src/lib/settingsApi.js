export async function getSettings() {
  const res = await fetch('/api/settings/get.php', { credentials: 'include' });
  if (!res.ok) throw new Error(`Get settings failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Get settings failed');
  return json.data.settings || {};
}

export async function updateSettings(settings) {
  const res = await fetch('/api/settings/update.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Update settings failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Update settings failed');
  return true;
}
