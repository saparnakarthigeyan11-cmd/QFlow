import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../components/AuthBrandPanel";
import { registerUser } from "../services/authService";
import { validateRegistration } from "../utils/validators";
import { ADMISSION_CATEGORIES } from "../data";
import { friendlyError } from "../utils/firebaseErrors";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Loading";

function Register() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  // Registration has its OWN state, separate from login.
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: ADMISSION_CATEGORIES[0],
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const problem = validateRegistration(regForm);
    if (problem) return setError(problem);

    setLoading(true);
    try {
      await registerUser(regForm);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Loading />;
  if (user && !loading) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <AuthBrandPanel />

        <div className="auth-card register-card">
          <div className="auth-heading">
            <span className="small-label">QFLOW PORTAL</span>
            <h2>Create Account</h2>
            <p>Register to access college services through QFlow.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your full name"
              value={regForm.name}
              onChange={handleChange}
            />

            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={regForm.email}
              onChange={handleChange}
            />

            <label htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="Enter 10-digit phone number"
              value={regForm.phone}
              onChange={handleChange}
            />

            <label htmlFor="reg-category">Admission Category</label>
            <select
              id="reg-category"
              name="category"
              value={regForm.category}
              onChange={handleChange}
            >
              {ADMISSION_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Min 8 characters, letters and numbers"
              value={regForm.password}
              onChange={handleChange}
            />

            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={regForm.confirmPassword}
              onChange={handleChange}
            />

            {error && <div className="form-error">{error}</div>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="register-line">
            <span>Already have an account?</span>
            <Link className="link-btn" to="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
