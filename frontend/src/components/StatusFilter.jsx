import { STATUS_LABELS } from '../utils/parcelSummary.js';

const filters = [['', 'ทั้งหมด'], ...Object.entries(STATUS_LABELS)];

function StatusFilter({ value, onChange }) {
  return (
    <div className="filter-bar" role="group" aria-label="กรองตามสถานะพัสดุ">
      {filters.map(([status, label]) => (
        <button
          className={value === status ? 'filter-active' : 'filter-button'}
          key={status || 'all'}
          type="button"
          onClick={() => onChange(status)}
          aria-pressed={value === status}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default StatusFilter;
