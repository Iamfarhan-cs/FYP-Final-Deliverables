import { useState, useEffect, useRef } from 'react';
import { getLiveTasks } from '../api';

const STATUS_STYLES = {
  pending: { background: '#f2f3f3', color: '#545b64', label: 'Pending' },
  running: { background: '#f1faff', color: '#0073bb', label: 'Running' },
  done:    { background: '#f2f8f0', color: '#1d8102', label: 'Done' },
};

export default function LiveExecutionTable() {
  const [tasks, setTasks] = useState([]);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const data = await getLiveTasks();
      setTasks(data);
    } catch {
      /* silently retry on next tick */
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;
    setPolling(true);
    fetchTasks();
    intervalRef.current = setInterval(fetchTasks, 1000);
  };

  const stopPolling = () => {
    setPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const runningCount = tasks.filter((t) => t.status === 'running').length;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Live Execution Tracker</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tasks.length > 0 && (
            <span className="text-muted-sm">
              {doneCount}/{tasks.length} done · {runningCount} running
            </span>
          )}
          <button
            className={`btn ${polling ? 'btn-outline' : 'btn-primary'}`}
            onClick={polling ? stopPolling : startPolling}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            {polling ? 'Stop' : 'Start Tracking'}
          </button>
        </div>
      </div>
      <div className="panel-body panel-body-flush" style={{ maxHeight: 360, overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {polling ? 'Waiting for tasks...' : 'Click "Start Tracking" to begin polling'}
          </div>
        ) : (
          <table className="vu-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Worker</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>Finish Time</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, idx) => {
                const s = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                return (
                  <tr key={t.task_id} className={idx % 2 === 0 ? 'row-even' : ''}>
                    <td>#{t.task_id}</td>
                    <td>{t.worker_id ?? '—'}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: s.background,
                          color: s.color,
                        }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td>{t.start_time != null ? t.start_time.toFixed(1) : '—'}</td>
                    <td>{t.finish_time != null ? t.finish_time.toFixed(1) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
