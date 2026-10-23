// Visual token card (live data from Firestore).
import StatusBadge from "./StatusBadge";

function TokenCard({ token, peopleAhead, waitMinutes, offline }) {
  const waiting = token.status === "Waiting";
  return (
    <div className="token-card">
      <div className="token-top">
        <span>YOUR TOKEN</span>
        <span className={`live-badge ${offline ? "demo" : ""}`}>{offline ? "● RECONNECTING" : "● LIVE"}</span>
      </div>

      <div className="big-token">{token.number}</div>
      <div className="token-service">{token.serviceTitle}</div>
      <div className="token-status-row">
        <StatusBadge status={token.status} />
      </div>

      <div className="token-details">
        <div>
          <span>People Ahead</span>
          <strong>{waiting ? peopleAhead : "—"}</strong>
        </div>
        <div>
          <span>Estimated Wait</span>
          <strong>{waiting ? `${waitMinutes} min` : "—"}</strong>
        </div>
        <div>
          <span>Counter</span>
          <strong>{token.counterName || "Not yet assigned"}</strong>
        </div>
      </div>
    </div>
  );
}

export default TokenCard;
