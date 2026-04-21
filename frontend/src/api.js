const BASE = '/api';

export async function uploadDataset(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload-dataset`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function runExperiment(algorithm) {
  const res = await fetch(`${BASE}/run-experiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Experiment failed');
  }
  return res.json();
}

export async function getMetrics(experimentId) {
  const res = await fetch(`${BASE}/metrics/${experimentId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to fetch metrics');
  }
  return res.json();
}

export function exportCSV(experimentId) {
  window.location.href = `${BASE}/export/${experimentId}`;
}

export async function getLiveTasks() {
  const res = await fetch(`${BASE}/tasks/live`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to fetch live tasks');
  }
  return res.json();
}

export async function getWorkerStats() {
  const res = await fetch(`${BASE}/worker-stats`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to fetch worker stats');
  }
  return res.json();
}
