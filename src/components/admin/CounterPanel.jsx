import { useState } from "react";
import { addCounter, createDefaultCounters, setCounterOpen } from "../../services/adminService";
import { friendlyError } from "../../utils/firebaseErrors";

function CounterPanel({ counters }) {
  const [error, setError] = useState("");

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const nextOrder = counters.reduce((max, c) => Math.max(max, c.order), 0) + 1;

  return (
    <div>
      {error && <div className="form-error">{error}</div>}

      {counters.length === 0 ? (
        <div className="empty-state">
          <p>No counters yet.</p>
          <button className="admin-btn admin-btn-main" onClick={() => run(() => createDefaultCounters(4))}>
            Create 4 default counters
          </button>
        </div>
      ) : (
        <>
          <div className="counter-grid">
            {counters.map((c) => (
              <div key={c.id} className={`counter-card counter-${c.status.toLowerCase()}`}>
                <strong>{c.name}</strong>
                <span className="counter-status">{c.status}</span>
                <span>{c.currentTokenNumber ? `Serving ${c.currentTokenNumber}` : "Idle"}</span>
                {c.status !== "Busy" && (
                  <button className="admin-btn" onClick={() => run(() => setCounterOpen(c, c.status === "Closed"))}>
                    {c.status === "Closed" ? "Open" : "Close"}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="admin-btn" onClick={() => run(() => addCounter(nextOrder))}>
            + Add Counter {nextOrder}
          </button>
        </>
      )}
    </div>
  );
}

export default CounterPanel;
