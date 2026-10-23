import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import QueueManager from "../components/admin/QueueManager";
import CounterPanel from "../components/admin/CounterPanel";
import ReportPanel from "../components/admin/ReportPanel";
import { subscribeCounters, subscribeTodayTokens } from "../services/adminService";
import { friendlyError } from "../utils/firebaseErrors";
import { todayIST } from "../utils/dates";

const TABS = ["Queues", "Counters", "Reports"];

function AdminDashboard() {
  const [date] = useState(todayIST);
  const [tokens, setTokens] = useState(null);
  const [counters, setCounters] = useState(null);
  const [tab, setTab] = useState("Queues");
  const [error, setError] = useState("");

  useEffect(() => {
    const onError = (err) => setError(friendlyError(err));
    const stopTokens = subscribeTodayTokens(date, setTokens, onError);
    const stopCounters = subscribeCounters(setCounters, onError);
    return () => {
      stopTokens();
      stopCounters();
    };
  }, [date]);

  const ready = tokens && counters;
  const count = (...statuses) => (tokens || []).filter((t) => statuses.includes(t.status)).length;
  const activeServices = new Set(
    (tokens || []).filter((t) => ["Waiting", "Called", "In Progress"].includes(t.status)).map((t) => t.serviceId)
  ).size;
  const availableCounters = (counters || []).filter((c) => c.status === "Available").length;

  const metrics = [
    ["Waiting tokens", count("Waiting")],
    ["Being served", count("Called", "In Progress")],
    ["Completed today", count("Completed")],
    ["Active services", activeServices],
    ["Available counters", `${availableCounters} / ${(counters || []).length}`],
  ];

  return (
    <div className="app-page">
      <Navbar admin />
      <main className="admin-main">
        <div className="admin-title">
          <span className="small-label">STAFF CONSOLE</span>
          <h2>Queue Management – {date}</h2>
        </div>

        {error && <div className="form-error">{error}</div>}
        {!ready && !error && <Loading text="Loading queue data..." />}

        {ready && (
          <>
            <div className="metric-grid">
              {metrics.map(([label, value]) => (
                <div className="metric-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="tab-row" role="tablist">
              {TABS.map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? "tab-on" : ""}`} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            <section className="admin-panel">
              {tab === "Queues" && <QueueManager tokens={tokens} counters={counters} />}
              {tab === "Counters" && <CounterPanel counters={counters} />}
              {tab === "Reports" && <ReportPanel tokens={tokens} date={date} />}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
