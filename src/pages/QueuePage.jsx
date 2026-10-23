import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useTokenTracking } from "../hooks/useTokenTracking";
import { cancelOwnToken } from "../services/queueService";
import { friendlyError } from "../utils/firebaseErrors";
import { formatTime } from "../utils/dates";

const PROGRESS = { Waiting: 25, Called: 55, "In Progress": 80, Completed: 100, Skipped: 25, Cancelled: 0 };

const MESSAGES = {
  Waiting: "Please wait for your token to be called. You can keep this page open.",
  Called: "Your token has been called. Please go to your counter now.",
  "In Progress": "You are being served.",
  Completed: "Your service is completed. Thank you!",
  Skipped: "Your token was skipped (you were not present when called). Please contact the help desk.",
  Cancelled: "This token was cancelled.",
};

function QueuePage() {
  const { tokenId } = useParams();
  const { user } = useAuth();
  const { token, peopleAhead, waitMinutes, loading, error, offline } = useTokenTracking(tokenId, user.uid);
  const [actionError, setActionError] = useState("");

  const handleCancel = async () => {
    if (!window.confirm("Cancel this token? You will lose your place in the queue.")) return;
    try {
      await cancelOwnToken(tokenId);
    } catch (err) {
      setActionError(friendlyError(err));
    }
  };

  return (
    <div className="app-page">
      <Navbar />
      <main className="queue-container">
        <div className="queue-heading">
          <span className="small-label">LIVE QUEUE STATUS</span>
          <h2>Track Your Token</h2>
        </div>

        {loading && <Loading text="Loading queue..." />}
        {error && <div className="form-error">{error}</div>}
        {offline && <div className="notice-box">Connection lost – showing last known status. Reconnecting...</div>}

        {token && (
          <div className="queue-card">
            <div className="queue-token">
              <span>Your Token</span>
              <strong>{token.number}</strong>
            </div>
            <div className="queue-service">
              <span>Service</span>
              <strong>{token.serviceTitle}</strong>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span>Queue Progress</span>
                <StatusBadge status={token.status} />
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${PROGRESS[token.status]}%` }}></div>
              </div>
            </div>

            <div className="queue-stats">
              <div>
                <span>People Ahead</span>
                <strong>{token.status === "Waiting" ? peopleAhead : "—"}</strong>
              </div>
              <div>
                <span>Estimated Wait</span>
                <strong>{token.status === "Waiting" ? `${waitMinutes} min` : "—"}</strong>
              </div>
              <div>
                <span>Counter</span>
                <strong>{token.counterName || "Not yet assigned"}</strong>
              </div>
            </div>

            <div className="waiting-box">{MESSAGES[token.status]}</div>
            {token.calledAt && <p className="estimate-note">Called at {formatTime(token.calledAt)}</p>}
            <p className="estimate-note">Estimates can change as staff serve the queue.</p>
            {actionError && <div className="form-error">{actionError}</div>}

            {token.status === "Waiting" && (
              <button className="secondary-btn" onClick={handleCancel}>
                Cancel My Token
              </button>
            )}
          </div>
        )}

        <Link className="secondary-btn btn-link" to="/dashboard">
          ← Back to Services
        </Link>
      </main>
    </div>
  );
}

export default QueuePage;
