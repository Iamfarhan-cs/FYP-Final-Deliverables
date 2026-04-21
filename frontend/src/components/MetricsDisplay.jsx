function formatNum(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function MetricsDisplay({ metrics, algorithm }) {
  if (!metrics) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Experiment Results</h2>
        <span className="tag tag-purple">{algorithm}</span>
      </div>
      <div className="panel-body">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Avg Waiting Time</div>
            <div className="stat-value text-primary">{formatNum(metrics.avg_waiting_time)} <span className="stat-unit">ms</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Turnaround Time</div>
            <div className="stat-value text-purple">{formatNum(metrics.avg_turnaround_time)} <span className="stat-unit">ms</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Makespan</div>
            <div className="stat-value text-orange">{metrics.makespan ?? '—'} <span className="stat-unit">ms</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Throughput</div>
            <div className="stat-value text-success">{metrics.throughput ?? '—'} <span className="stat-unit">tasks/ms</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value text-primary">{metrics.total_tasks}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
