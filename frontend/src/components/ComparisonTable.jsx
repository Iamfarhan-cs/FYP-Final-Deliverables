function formatNum(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ComparisonTable({ results }) {
  if (results.length === 0) return null;

  const bestWaiting = Math.min(...results.map((r) => r.avg_waiting_time));
  const bestTurnaround = Math.min(...results.map((r) => r.avg_turnaround_time));
  const bestMakespan = Math.min(...results.map((r) => r.makespan ?? Infinity));
  const bestThroughput = Math.max(...results.map((r) => r.throughput ?? 0));

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Algorithm Comparison</h2>
        <span className="text-muted-sm">{results.length} experiment{results.length > 1 ? 's' : ''}</span>
      </div>
      <div className="panel-body panel-body-flush">
        <table className="vu-table">
          <thead>
            <tr>
              <th>Experiment</th>
              <th>Algorithm</th>
              <th>Avg Waiting Time (ms)</th>
              <th>Avg Turnaround Time (ms)</th>
              <th>Makespan (ms)</th>
              <th>Throughput (tasks/ms)</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={r.experiment_id} className={idx % 2 === 0 ? 'row-even' : ''}>
                <td>#{r.experiment_id}</td>
                <td><span className="tag tag-purple">{r.algorithm}</span></td>
                <td className={r.avg_waiting_time === bestWaiting ? 'cell-best' : ''}>
                  {formatNum(r.avg_waiting_time)} ms
                  {r.avg_waiting_time === bestWaiting && results.length > 1 && (
                    <span className="best-badge">Best</span>
                  )}
                </td>
                <td className={r.avg_turnaround_time === bestTurnaround ? 'cell-best' : ''}>
                  {formatNum(r.avg_turnaround_time)} ms
                  {r.avg_turnaround_time === bestTurnaround && results.length > 1 && (
                    <span className="best-badge">Best</span>
                  )}
                </td>
                <td className={r.makespan === bestMakespan ? 'cell-best' : ''}>
                  {r.makespan ?? '—'} ms
                  {r.makespan === bestMakespan && results.length > 1 && (
                    <span className="best-badge">Best</span>
                  )}
                </td>
                <td className={r.throughput === bestThroughput ? 'cell-best' : ''}>
                  {r.throughput ?? '—'}
                  {r.throughput === bestThroughput && results.length > 1 && (
                    <span className="best-badge">Best</span>
                  )}
                </td>
                <td>{r.total_tasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
