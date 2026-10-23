import { SERVICES } from "../../data";
import { toMillis } from "../../utils/dates";

// Basic daily report built from today's tokens.
// Average wait = time from token creation to the moment it was called.
function ReportPanel({ tokens, date }) {
  const rows = SERVICES.map((s) => {
    const list = tokens.filter((t) => t.serviceId === s.id);
    const waits = list
      .filter((t) => toMillis(t.calledAt) && toMillis(t.createdAt))
      .map((t) => (toMillis(t.calledAt) - toMillis(t.createdAt)) / 60000);
    return {
      id: s.id,
      title: s.title,
      issued: list.length,
      completed: list.filter((t) => t.status === "Completed").length,
      skipped: list.filter((t) => t.status === "Skipped").length,
      cancelled: list.filter((t) => t.status === "Cancelled").length,
      active: list.filter((t) => ["Waiting", "Called", "In Progress"].includes(t.status)).length,
      avgWait: waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : null,
    };
  });

  const total = (key) => rows.reduce((sum, r) => sum + r[key], 0);

  return (
    <div>
      <p className="muted">Report for {date}</p>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service</th><th>Issued</th><th>Completed</th><th>Skipped</th><th>Cancelled</th><th>Still active</th><th>Avg wait (min)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td><td>{r.issued}</td><td>{r.completed}</td><td>{r.skipped}</td>
                <td>{r.cancelled}</td><td>{r.active}</td><td>{r.avgWait ?? "—"}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td>Total</td><td>{total("issued")}</td><td>{total("completed")}</td><td>{total("skipped")}</td>
              <td>{total("cancelled")}</td><td>{total("active")}</td><td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportPanel;
