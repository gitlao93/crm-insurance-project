import { Navigate } from "react-router-dom";
import AuthService from "../services/authService";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[]; // 👈 added: roles that can access this route
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const isAuthenticated = AuthService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Get user data (assuming it's stored in localStorage)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // ✅ Check if user’s role is allowed for this route
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />; // or redirect to /403 page if you prefer
  }

  return children;
};

export default PrivateRoute;
