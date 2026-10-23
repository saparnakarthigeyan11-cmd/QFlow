import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../components/AuthBrandPanel";
import { loginUser } from "../services/authService";
import { validateEmail } from "../utils/validators";
import { friendlyError } from "../utils/firebaseErrors";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Loading";

function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Login has its OWN state. It never touches the registration form.
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const emailError = validateEmail(loginForm.email);
    if (emailError) return setError(emailError);
    if (!loginForm.password) return setError("Password is required.");

    setLoading(true);
    try {
      await loginUser(loginForm);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <AuthBrandPanel />

        <div className="auth-card">
          <div className="auth-heading">
            <span className="small-label">QFLOW PORTAL</span>
            <h2>Welcome Back</h2>
            <p>Login to access college services and manage your queue.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={handleChange}
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={loginForm.password}
              onChange={handleChange}
            />

            {error && <div className="form-error">{error}</div>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login to QFlow"}
            </button>
          </form>

          <div className="register-line">
            <span>New to QFlow?</span>
            <Link className="link-btn" to="/register">
              Create Account
            </Link>
          </div>
          <div className="register-line">
            <Link className="link-btn" to="/admin/login">
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
