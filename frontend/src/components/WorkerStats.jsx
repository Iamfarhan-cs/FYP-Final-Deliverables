import { useEffect, useState } from 'react';
import { getWorkerStats } from '../api';

export default function WorkerStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getWorkerStats()
      .then((data) => { if (mounted) setStats(data); })
      .catch((e) => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const maxBusy = Math.max(...stats.map(s => s.busy_time || 0), 1);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Worker Statistics</h2>
      </div>
      <div className="panel-body panel-body-flush">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : stats.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data</div>
        ) : (
          <table className="vu-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Tasks Processed</th>
                <th>Busy Time</th>
                <th style={{ width: 120 }}>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, idx) => (
                <tr key={s.worker_id} className={idx % 2 === 0 ? 'row-even' : ''}>
                  <td>{s.worker_id}</td>
                  <td>{s.tasks_processed}</td>
                  <td>{s.busy_time}</td>
                  <td>
                    <div style={{ background: '#f1faff', borderRadius: 4, height: 12, width: 100, position: 'relative' }}>
                      <div style={{
                        background: '#0073bb',
                        height: 12,
                        borderRadius: 4,
                        width: `${Math.round((s.busy_time / maxBusy) * 100)}%`,
                        transition: 'width 0.5s',
                      }} />
                      <span style={{
                        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                        fontSize: 10, color: '#222', textAlign: 'center', lineHeight: '12px', fontWeight: 600
                      }}>{Math.round((s.busy_time / maxBusy) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
