import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/storage";
import { PATHS } from "./paths";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to={PATHS.home} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === "admin" ? PATHS.admin : PATHS.employee;
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
