import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { userData } = useContext(AuthContext);
  const location = useLocation();

  if (!userData) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Renders nested route components when used without explicit children props
  return children ? children : <Outlet />;
}