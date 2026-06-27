/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role = null;

  try {
    const decoded = jwtDecode(token);
    role = decoded.role.toLowerCase();
  } catch (err) {
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

