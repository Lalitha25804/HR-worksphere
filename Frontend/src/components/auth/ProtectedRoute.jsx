import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, role, roles }) => {
  const { user, token, loading } = useAuth();

  // ⛔ Wait until auth loads
  if (loading) return null;

  // 🔐 Support BOTH systems (context + localStorage fallback)
  const storedToken = token || localStorage.getItem("token");

  const storedRole =
    user?.role ||
    localStorage.getItem("role") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.role;

  // ❌ No token → redirect
  if (!storedToken) {
    return <Navigate to="/get-started" replace />;
  }

  // ❌ No role → reset + redirect
  if (!storedRole) {
    localStorage.clear();
    return <Navigate to="/get-started" replace />;
  }

  // ✅ Single role support (your current system)
  if (role && storedRole !== role) {
    return <Navigate to="/get-started" replace />;
  }

  // ✅ Multi-role support (future-proof)
  if (roles && !roles.includes(storedRole)) {
    return <Navigate to="/get-started" replace />;
  }

  return children;
};

export default ProtectedRoute;