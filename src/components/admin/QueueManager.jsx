import { Fragment, useState } from "react";
import StatusBadge from "../StatusBadge";
import { SERVICES, ACTIVE_STATUSES } from "../../data";
import { callToken, changeTokenStatus, getRequestForToken } from "../../services/adminService";
import { friendlyError } from "../../utils/firebaseErrors";
import { formatTime, minutesSince } from "../../utils/dates";

function QueueManager({ tokens, counters }) {
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [counterId, setCounterId] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [busyId, setBusyId] = useState("");
  const [details, setDetails] = useState({}); // tokenId -> request data

  const availableCounters = counters.filter((c) => c.status === "Available");
  const chosenCounter = availableCounters.find((c) => c.id === counterId) || availableCounters[0];

  const serviceTokens = tokens
    .filter((t) => t.serviceId === serviceId)
    .sort((a, b) => a.sequence - b.sequence);
  const visible = showAll ? serviceTokens : serviceTokens.filter((t) => ACTIVE_STATUSES.includes(t.status) || t.status === "Skipped");
  const nextWaiting = serviceTokens.find((t) => t.status === "Waiting");

  const run = async (id, action) => {
    setBusyId(id);
    setMessage({ type: "", text: "" });
    try {
      await action();
    } catch (err) {
      setMessage({ type: "error", text: friendlyError(err) });
    } finally {
      setBusyId("");
    }
  };

  const needCounter = () => {
    if (!chosenCounter) throw new Error("No counter is available. Open or free a counter first.");
    return chosenCounter.id;
  };

  const toggleDetails = async (tokenId) => {
    if (details[tokenId] !== undefined) {
      const copy = { ...details };
      delete copy[tokenId];
      return setDetails(copy);
    }
    try {
      const req = await getRequestForToken(tokenId);
      setDetails({ ...details, [tokenId]: req || false });
    } catch (err) {
      setMessage({ type: "error", text: friendlyError(err) });
    }
  };

  return (
    <div>
      <div className="chip-row" role="tablist" aria-label="Services">
        {SERVICES.map((s) => {
          const waiting = tokens.filter((t) => t.serviceId === s.id && t.status === "Waiting").length;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={serviceId === s.id}
              className={`chip ${serviceId === s.id ? "chip-on" : ""}`}
              onClick={() => setServiceId(s.id)}
            >
              {s.icon} {s.title} {waiting > 0 && <span className="chip-count">{waiting}</span>}
            </button>
          );
        })}
      </div>

      <div className="admin-toolbar">
        <label htmlFor="counter-select">Counter</label>
        <select id="counter-select" value={chosenCounter?.id || ""} onChange={(e) => setCounterId(e.target.value)}>
          {availableCounters.length === 0 && <option value="">No counter available</option>}
          {availableCounters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className="admin-btn admin-btn-main"
          disabled={!nextWaiting || !chosenCounter || busyId === "next"}
          onClick={() => run("next", () => callToken(nextWaiting.id, needCounter()))}
        >
          Call Next{nextWaiting ? ` (${nextWaiting.number})` : ""}
        </button>
        <label className="check-label">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show completed / cancelled
        </label>
      </div>

      {message.text && <div className="form-error">{message.text}</div>}

      {visible.length === 0 ? (
        <div className="empty-state">No tokens in this queue today.</div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Status</th>
                <th>Waiting</th>
                <th>Counter</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => {
                const b = busyId === t.id;
                return (
                  <Fragment key={t.id}>
                    <tr>
                      <td><strong>{t.number}</strong></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>{t.status === "Waiting" ? `${minutesSince(t.createdAt)} min` : "—"}</td>
                      <td>{t.counterName || "—"}</td>
                      <td>{formatTime(t.createdAt)}</td>
                      <td className="action-cell">
                        {(t.status === "Waiting" || t.status === "Skipped") && (
                          <button className="admin-btn" disabled={b} onClick={() => run(t.id, () => callToken(t.id, needCounter()))}>Call</button>
                        )}
                        {t.status === "Called" && (
                          <button className="admin-btn" disabled={b} onClick={() => run(t.id, () => changeTokenStatus(t.id, "In Progress"))}>Start</button>
                        )}
                        {(t.status === "In Progress" || t.status === "Called") && (
                          <button className="admin-btn" disabled={b} onClick={() => run(t.id, () => changeTokenStatus(t.id, "Completed"))}>Complete</button>
                        )}
                        {(t.status === "Waiting" || t.status === "Called") && (
                          <button className="admin-btn" disabled={b} onClick={() => run(t.id, () => changeTokenStatus(t.id, "Skipped"))}>Skip</button>
                        )}
                        {["Waiting", "Called", "Skipped"].includes(t.status) && (
                          <button className="admin-btn admin-btn-danger" disabled={b} onClick={() => run(t.id, () => changeTokenStatus(t.id, "Cancelled"))}>Cancel</button>
                        )}
                        <button className="admin-btn" onClick={() => toggleDetails(t.id)}>
                          {details[t.id] !== undefined ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {details[t.id] !== undefined && (
                      <tr className="detail-row">
                        <td colSpan={6}>
                          {details[t.id] === false ? (
                            "No request details found."
                          ) : (
                            <dl className="detail-list">
                              {Object.entries(details[t.id].details).map(([k, v]) => (
                                <div key={k}>
                                  <dt>{k}</dt>
                                  <dd>{v || "—"}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default QueueManager;
