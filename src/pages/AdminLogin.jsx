import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginStaff } from "../services/authService";
import { friendlyError } from "../utils/firebaseErrors";
import { validateEmail } from "../utils/validators";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Loading";

function AdminLogin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(location.state?.denied ? "This account is not authorised for staff access." : "");
  const [loading, setLoading] = useState(false);

  if (authLoading) return <Loading />;
  if (user && isAdmin && !loading) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const emailError = validateEmail(form.email);
    if (emailError) return setError(emailError);
    if (!form.password) return setError("Password is required.");

    setLoading(true);
    try {
      await loginStaff(form);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card admin-login-card">
        <div className="auth-heading">
          <span className="small-label">QFLOW STAFF CONSOLE</span>
          <h2>Staff Login</h2>
          <p>For authorised college staff only.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="staff-email">Email Address</label>
          <input
            id="staff-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setError("");
            }}
          />
          <label htmlFor="staff-password">Password</label>
          <input
            id="staff-password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setError("");
            }}
          />
          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Login as Staff"}
          </button>
        </form>
        <div className="register-line">
          <Link className="link-btn" to="/login">
            ← Student login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
