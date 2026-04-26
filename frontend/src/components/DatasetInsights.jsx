function formatNum(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const STATS = [
  { key: 'min_execution_time', label: 'Min Execution Time', unit: 'ms', colorClass: 'text-primary' },
  { key: 'max_execution_time', label: 'Max Execution Time', unit: 'ms', colorClass: 'text-purple' },
  { key: 'avg_execution_time', label: 'Avg Execution Time', unit: 'ms', colorClass: 'text-orange' },
  { key: 'total_tasks',        label: 'Total Tasks',        unit: '',   colorClass: 'text-success' },
];

export default function DatasetInsights({ insights }) {
  if (!insights) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Dataset Insights</h2>
      </div>
      <div className="panel-body">
        <div className="stats-row">
          {STATS.map(({ key, label, unit, colorClass }) => (
            <div className="stat-card" key={key}>
              <div className="stat-label">{label}</div>
              <div className={`stat-value ${colorClass}`}>
                {formatNum(insights[key])}
                {unit && <span className="stat-unit"> {unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
