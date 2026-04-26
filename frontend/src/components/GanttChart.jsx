import { useState, useEffect } from 'react';
import { getGantt } from '../api';

const COLORS = [
  '#0073bb', '#6b48ff', '#ff9900', '#1d8102', '#d13212',
  '#00a591', '#8c4fff', '#c7611c', '#006f69', '#8b1a1a',
];

function workerColor(workerId) {
  // derive a stable index from the trailing number in "worker-N"
  const n = parseInt(workerId.replace(/\D/g, ''), 10);
  return COLORS[(isNaN(n) ? 0 : n) % COLORS.length];
}

export default function GanttChart({ experimentId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!experimentId) return;
    let mounted = true;
    setLoading(true);
    setError('');
    getGantt(experimentId)
      .then((data) => { if (mounted) setRows(data); })
      .catch((e) => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [experimentId]);

  if (!experimentId) return null;

  // group by worker_id preserving insertion order
  const workerMap = new Map();
  for (const task of rows) {
    if (!workerMap.has(task.worker_id)) workerMap.set(task.worker_id, []);
    workerMap.get(task.worker_id).push(task);
  }

  const allStart = rows.length ? Math.min(...rows.map((r) => r.start_time)) : 0;
  const allEnd   = rows.length ? Math.max(...rows.map((r) => r.finish_time)) : 1;
  const span     = allEnd - allStart || 1;

  const ROW_HEIGHT = 36;
  const LABEL_W   = 90; // px reserved for worker label

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Gantt Chart</h2>
        <span className="text-muted-sm">Experiment #{experimentId}</span>
      </div>
      <div className="panel-body">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading…
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No completed tasks yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* time axis */}
            <div style={{ display: 'flex', marginLeft: LABEL_W, marginBottom: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span style={{ flex: 1, textAlign: 'left' }}>{allStart.toFixed(1)}s</span>
              <span style={{ flex: 1, textAlign: 'center' }}>{((allStart + allEnd) / 2).toFixed(1)}s</span>
              <span style={{ flex: 1, textAlign: 'right' }}>{allEnd.toFixed(1)}s</span>
            </div>

            {/* worker rows */}
            {[...workerMap.entries()].map(([workerId, tasks]) => (
              <div
                key={workerId}
                style={{ display: 'flex', alignItems: 'center', marginBottom: 6, minWidth: 400 }}
              >
                {/* worker label */}
                <div style={{
                  width: LABEL_W,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  paddingRight: 8,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}>
                  {workerId}
                </div>

                {/* timeline track */}
                <div style={{
                  flex: 1,
                  height: ROW_HEIGHT,
                  background: '#f2f3f3',
                  borderRadius: 4,
                  position: 'relative',
                  minWidth: 300,
                }}>
                  {tasks.map((t) => {
                    const left  = ((t.start_time  - allStart) / span) * 100;
                    const width = ((t.finish_time - t.start_time) / span) * 100;
                    const color = workerColor(workerId);
                    return (
                      <div
                        key={t.task_id}
                        title={`Task #${t.task_id}\nStart: ${t.start_time.toFixed(2)}s\nFinish: ${t.finish_time.toFixed(2)}s\nDuration: ${(t.finish_time - t.start_time).toFixed(2)}s`}
                        style={{
                          position: 'absolute',
                          left: `${left}%`,
                          width: `max(${width}%, 2%)`,
                          height: '100%',
                          background: color,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'default',
                          boxSizing: 'border-box',
                          border: '1px solid rgba(0,0,0,0.12)',
                        }}
                      >
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          padding: '0 3px',
                        }}>
                          #{t.task_id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
