import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

// Staff pages. A normal user who types /admin in the URL is sent away.
function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <Loading text="Checking your access..." />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ denied: true }} />;
  return <Outlet />;
}

export default AdminRoute;
