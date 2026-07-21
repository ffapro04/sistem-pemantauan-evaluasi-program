/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { clearAuthSession, getAuthSessionExpiresAt, getAuthToken } from "../../utils/authSession";

export default function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate();
  const token = getAuthToken();

  useEffect(() => {
    if (!token) return undefined;

    const expiresAt = getAuthSessionExpiresAt();
    const delay = Math.max(0, expiresAt - Date.now());
    const timer = window.setTimeout(() => {
      clearAuthSession();
      navigate("/login", { replace: true });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role = null;

  try {
    const decoded = jwtDecode(token);
    role = decoded.role.toLowerCase();
  } catch (err) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600"> Akses Ditolak</h1>
        <p className="text-gray-600 mt-2">
          Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
      </div>
    );
  }

  return children;
}

