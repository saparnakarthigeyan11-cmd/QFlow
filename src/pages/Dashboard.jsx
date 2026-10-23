import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceCard from "../components/ServiceCard";
import StatusBadge from "../components/StatusBadge";
import { SERVICES, COLLEGE, ACTIVE_STATUSES } from "../data";
import { useAuth } from "../hooks/useAuth";
import { subscribeMyTokens } from "../services/queueService";
import { friendlyError } from "../utils/firebaseErrors";

function Dashboard() {
  const { user, displayName } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [tokenError, setTokenError] = useState("");

  useEffect(
    () =>
      subscribeMyTokens(
        user.uid,
        (list) => {
          setTokens(list);
          setTokenError("");
        },
        (err) => setTokenError(friendlyError(err))
      ),
    [user.uid]
  );

  const activeTokens = tokens.filter((t) => ACTIVE_STATUSES.includes(t.status));

  return (
    <div className="app-page">
      <Navbar />

      <main className="dashboard">
        <section className="hero">
          <div>
            <span className="small-label">STUDENT SERVICES PORTAL</span>
            <h2>Welcome, {displayName} 👋</h2>
            <p>
              Select a service below and get your virtual queue token without waiting in a physical
              line.
            </p>
          </div>
          <div className="hero-icon">Q</div>
        </section>

        {tokenError && <div className="form-error">{tokenError}</div>}

        {activeTokens.length > 0 && (
          <section className="my-tokens">
            <span className="small-label">YOUR ACTIVE TOKENS TODAY</span>
            <div className="my-token-list">
              {activeTokens.map((t) => (
                <Link key={t.id} to={`/queue/${t.id}`} className="my-token">
                  <strong>{t.number}</strong>
                  <span>{t.serviceTitle}</span>
                  <StatusBadge status={t.status} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="services-section">
          <div className="section-heading">
            <div>
              <span className="small-label">SERVICES</span>
              <h2>What do you need help with?</h2>
            </div>
            <span className="service-count">{SERVICES.length} Services</span>
          </div>

          <div className="services-grid">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        <section className="about-card">
          <div className="about-content">
            <div className="section-label">ABOUT THE PORTAL</div>
            <h3 className="college-name">{COLLEGE.name}</h3>
            <p>
              QFlow provides a digital platform for students and applicants to access admission,
              document verification, fee payment and other college services.
            </p>
          </div>

          <div className="location-box">
            <div className="location-icon">📍</div>
            <h4 className="location-title">Coimbatore</h4>
            <p className="location-text">
              Tamil Nadu –<br />
              641062
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
