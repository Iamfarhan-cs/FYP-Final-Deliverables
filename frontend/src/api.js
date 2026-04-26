const BASE = '/api';

function extractError(err, fallback) {
  return err.error || err.detail || fallback;
}

export async function uploadDataset(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload-dataset`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Upload failed'));
  }
  return res.json();
}

export async function runExperiment(algorithm, quantum) {
  const body = { algorithm };
  if (algorithm === 'RR' && quantum != null) body.quantum = quantum;
  const res = await fetch(`${BASE}/run-experiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Experiment failed'));
  }
  return res.json();
}

export async function getMetrics(experimentId) {
  const res = await fetch(`${BASE}/metrics/${experimentId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Failed to fetch metrics'));
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
    throw new Error(extractError(err, 'Failed to fetch live tasks'));
  }
  return res.json();
}

export async function getWorkerStats() {
  const res = await fetch(`${BASE}/worker-stats`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Failed to fetch worker stats'));
  }
  return res.json();
}

export async function getGantt(experimentId) {
  const res = await fetch(`${BASE}/gantt/${experimentId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Failed to fetch Gantt data'));
  }
  return res.json();
}

export async function getDatasetInsights() {
  const res = await fetch(`${BASE}/dataset-insights`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Failed to fetch dataset insights'));
  }
  return res.json();
}

export async function resetSystem() {
  const res = await fetch(`${BASE}/reset`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Reset failed'));
  }
  return res.json();
}

export async function getLogs() {
  const res = await fetch(`${BASE}/logs`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(extractError(err, 'Failed to fetch logs'));
  }
  return res.json();
}
