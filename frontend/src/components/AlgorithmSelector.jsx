const ALGORITHMS = [
  { value: 'FCFS', label: 'FCFS', desc: 'First Come First Served' },
  { value: 'SJF', label: 'SJF', desc: 'Shortest Job First' },
  { value: 'RR', label: 'RR', desc: 'Round Robin (q=2)' },
];

export default function AlgorithmSelector({ selected, onChange }) {
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
    </div>
  );
}
