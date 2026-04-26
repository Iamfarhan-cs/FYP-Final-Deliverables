import { useState, useEffect, useRef } from 'react';
import { getLogs } from '../api';

export default function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const data = await getLogs();
      setLogs(data);
    } catch {
      /* retry on next tick */
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;
    setPolling(true);
    fetchLogs();
    intervalRef.current = setInterval(fetchLogs, 1500);
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

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Execution Logs</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {logs.length > 0 && (
            <span className="text-muted-sm">{logs.length} entries</span>
          )}
          <button
            className={`btn ${polling ? 'btn-outline' : 'btn-primary'}`}
            onClick={polling ? stopPolling : startPolling}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            {polling ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
      <div
        className="panel-body"
        style={{
          maxHeight: 280,
          overflowY: 'auto',
          padding: 0,
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          lineHeight: 1.7,
          background: '#1a1f25',
          color: '#d5dbdb',
          borderRadius: '0 0 var(--radius) var(--radius)',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
            {polling ? 'Waiting for logs…' : 'Click "Start" to stream logs'}
          </div>
        ) : (
          <div style={{ padding: '0.75rem 1rem' }}>
            {logs.map((line, i) => {
              const isFinished = line.includes('finished');
              return (
                <div key={i} style={{ color: isFinished ? '#1d8102' : '#0073bb' }}>
                  <span style={{ color: '#7f8c8d', marginRight: '0.5rem' }}>{String(i + 1).padStart(2, '0')}</span>
                  {line}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
