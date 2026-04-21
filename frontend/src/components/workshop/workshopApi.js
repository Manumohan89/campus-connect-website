// Uses the same API base as the rest of campus-connect
// Normalizes REACT_APP_API_URL to always end with /api
const API_BASE = (() => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.endsWith('/api') ? envUrl : envUrl.replace(/\/$/, '') + '/api';
  return '/api';
})();

export async function submitWorkshopFeedback(data) {
  const response = await fetch(`${API_BASE}/workshop-feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Submission failed');
  return result;
}

export async function fetchWorkshopFeedback(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/workshop-feedback?${query}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Fetch failed');
  return result;
}
