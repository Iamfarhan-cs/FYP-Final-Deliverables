const BOX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem 1.25rem',
  borderRadius: 'var(--radius)',
  fontWeight: 600,
  fontSize: '0.82rem',
  whiteSpace: 'nowrap',
};

const ARROW = {
  fontSize: '1.1rem',
  color: 'var(--text-secondary)',
  margin: '0 0.6rem',
  flexShrink: 0,
};

export default function ArchitectureInfo() {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>System Architecture</h2>
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Flow diagram */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem 0' }}>
          <span style={{ ...BOX, background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
            Scheduler (Backend)
          </span>
          <span style={ARROW}>→</span>
          <span style={{ ...BOX, background: '#fff4e6', color: '#c7611c', border: '1px solid var(--orange)' }}>
            Redis Queue
          </span>
          <span style={ARROW}>→</span>
          <span style={{ ...BOX, background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)' }}>
            10 Worker Nodes
          </span>
        </div>

        {/* Description */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Tasks are scheduled by the backend using the selected algorithm, pushed to a Redis queue for distribution,
          and processed concurrently by 10 worker containers.
        </div>
      </div>
    </div>
  );
}
