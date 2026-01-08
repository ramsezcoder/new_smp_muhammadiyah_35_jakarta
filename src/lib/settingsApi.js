import { getAuthHeaders, assertApiOk } from '@/lib/utils';

export async function getSettings() {
  const res = await fetch('/api/settings/get.php', { 
    headers: getAuthHeaders('application/json'),
    credentials: 'include' 
  });
  const json = await assertApiOk(res, 'Get settings failed');
  return json.data.settings || {};
}

export async function updateSettings(settings) {
  const res = await fetch('/api/settings/update.php', {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(settings),
    credentials: 'include'
  });
  await assertApiOk(res, 'Update settings failed');
  return true;
}
