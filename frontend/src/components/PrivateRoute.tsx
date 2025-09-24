import { Navigate } from "react-router-dom";
import AuthService from "../services/authService";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = AuthService.isAuthenticated();

  // if not logged in → redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // if logged in → render the page
  return children;
};

export default PrivateRoute;
