import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";

// Top bar shown on every page after login.
function Navbar({ admin = false }) {
  const { profile, displayName, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate(admin ? "/admin/login" : "/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <Link to={admin ? "/admin" : "/dashboard"} className="nav-brand">
        <div className="nav-logo">Q</div>
        <div>
          <strong>QFlow</strong>
          <span>{admin ? "Staff Console" : "Smart Queue Management"}</span>
        </div>
      </Link>

      <div className="nav-right">
        {!admin && isAdmin && (
          <Link to="/admin" className="nav-link">
            Staff Dashboard
          </Link>
        )}
        {admin && (
          <Link to="/dashboard" className="nav-link">
            Student View
          </Link>
        )}
        <div className="nav-user">
          <strong>{displayName}</strong>
          <span>{admin ? "Staff" : profile?.category}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
