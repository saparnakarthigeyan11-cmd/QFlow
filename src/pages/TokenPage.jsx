import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import TokenCard from "../components/TokenCard";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import { useTokenTracking } from "../hooks/useTokenTracking";

function TokenPage() {
  const { tokenId } = useParams();
  const { user } = useAuth();
  const { token, peopleAhead, waitMinutes, loading, error, offline } = useTokenTracking(tokenId, user.uid);

  return (
    <div className="app-page">
      <Navbar />
      <main className="token-container">
        {loading && <Loading text="Loading your token..." />}
        {error && <div className="form-error">{error}</div>}

        {token && (
          <>
            <div className="success-badge">✓ TOKEN GENERATED</div>
            <h2>Your Virtual Token</h2>
            <p className="token-subtitle">
              You have joined the queue. This card updates automatically.
            </p>

            <TokenCard token={token} peopleAhead={peopleAhead} waitMinutes={waitMinutes} offline={offline} />
            <p className="estimate-note">
              Waiting time is an estimate (people ahead × average service time) and can change.
            </p>

            <div className="token-actions">
              <Link className="primary-btn btn-link" to={`/queue/${token.id}`}>
                Track My Queue
              </Link>
              <Link className="secondary-btn btn-link" to="/dashboard">
                Choose Another Service
              </Link>
            </div>
          </>
        )}
        {!loading && !token && (
          <Link className="secondary-btn btn-link" to="/dashboard">
            ← Back to Services
          </Link>
        )}
      </main>
    </div>
  );
}

export default TokenPage;
