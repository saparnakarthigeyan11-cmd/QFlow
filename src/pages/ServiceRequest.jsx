import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getService } from "../data";
import { useAuth } from "../hooks/useAuth";
import { createServiceRequestWithToken } from "../services/queueService";
import { validateServiceForm } from "../utils/validators";
import { friendlyError } from "../utils/firebaseErrors";

// One page for all 8 services. The form fields come from data.js.
// Every service is independent: nobody has to do an enquiry before paying fees.
function ServiceRequest() {
  const { serviceId } = useParams();
  const service = getService(serviceId);
  const { user, profile, displayName } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(() => {
    const initial = {};
    service?.fields.forEach((f) => {
      if (f.prefill === "name") initial[f.name] = displayName === "Student" ? "" : displayName;
      else if (f.prefill === "category") initial[f.name] = profile?.category || f.options?.[0] || "";
      else initial[f.name] = f.type === "select" ? f.options[0] : "";
    });
    return initial;
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!service) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return; // stops double submissions

    const problem = validateServiceForm(service, values);
    if (problem) return setError(problem);

    setBusy(true);
    try {
      const details = {};
      service.fields.forEach((f) => {
        details[f.name] = (values[f.name] || "").trim();
      });
      const { tokenId } = await createServiceRequestWithToken({ user, service, details });
      navigate(`/token/${tokenId}`, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />
      <main className="request-container">
        <Link to="/dashboard" className="back-link">
          ← Back to services
        </Link>

        <div className="auth-card request-card">
          <div className="auth-heading">
            <span className="small-label">{service.title.toUpperCase()}</span>
            <h2>
              {service.icon} {service.title}
            </h2>
            <p>{service.text}</p>
          </div>

          {service.notice && <div className="notice-box">{service.notice}</div>}

          {service.checklist && (
            <div className="checklist-box">
              <strong>Bring these documents:</strong>
              <ul>
                {service.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {service.fields.map((f) => (
              <div key={f.name}>
                <label htmlFor={`f-${f.name}`}>{f.label}</label>
                {f.type === "select" && (
                  <select id={`f-${f.name}`} name={f.name} value={values[f.name]} onChange={handleChange}>
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                )}
                {f.type === "textarea" && (
                  <textarea
                    id={`f-${f.name}`}
                    name={f.name}
                    rows={4}
                    maxLength={500}
                    placeholder={f.placeholder}
                    value={values[f.name]}
                    onChange={handleChange}
                  />
                )}
                {f.type === "text" && (
                  <input
                    id={`f-${f.name}`}
                    type="text"
                    name={f.name}
                    maxLength={200}
                    placeholder={f.placeholder}
                    value={values[f.name]}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}

            {error && <div className="form-error">{error}</div>}

            <button className="primary-btn" type="submit" disabled={busy}>
              {busy ? "Generating token..." : "Submit & Get Token"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ServiceRequest;
