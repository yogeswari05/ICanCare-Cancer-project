import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

export default PrivateRoute;