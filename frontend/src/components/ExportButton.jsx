import { exportCSV } from '../api';

export default function ExportButton({ experimentId }) {
  if (!experimentId) return null;

  return (
    <button className="btn btn-outline" onClick={() => exportCSV(experimentId)}>
      ↓ Export CSV
    </button>
  );
}
