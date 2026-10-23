const CLASS = {
  Waiting: "st-waiting",
  Called: "st-called",
  "In Progress": "st-progress",
  Completed: "st-done",
  Skipped: "st-skipped",
  Cancelled: "st-cancelled",
};

function StatusBadge({ status }) {
  return <span className={`status-badge ${CLASS[status] || ""}`}>{status}</span>;
}

export default StatusBadge;
