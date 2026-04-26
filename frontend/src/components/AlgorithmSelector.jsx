const ALGORITHMS = [
  { value: 'FCFS', label: 'FCFS', desc: 'First Come First Served' },
  { value: 'SJF', label: 'SJF', desc: 'Shortest Job First' },
  { value: 'RR', label: 'RR', desc: 'Round Robin' },
];

export default function AlgorithmSelector({ selected, onChange, quantum, onQuantumChange }) {
  return (
    <div className="algo-selector">
      <label className="algo-label">Select Algorithm</label>
      <div className="algo-options">
        {ALGORITHMS.map((alg) => (
          <button
            key={alg.value}
            className={`algo-option ${selected === alg.value ? 'algo-option-active' : ''}`}
            onClick={() => onChange(alg.value)}
            type="button"
          >
            <span className="algo-option-name">{alg.label}</span>
            <span className="algo-option-desc">{alg.desc}</span>
          </button>
        ))}
      </div>
      {selected === 'RR' && (
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="rr-quantum" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Time Quantum
          </label>
          <input
            id="rr-quantum"
            type="number"
            min={1}
            value={quantum}
            onChange={(e) => onQuantumChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{
              width: 72,
              padding: '0.25rem 0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--text)',
            }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ms</span>
        </div>
      )}
    </div>
  );
}
