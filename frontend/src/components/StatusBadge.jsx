import { STATUS_LABELS } from '../utils/parcelSummary.js';

function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export default StatusBadge;
