import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const currentUser = localStorage.getItem("user");
  return currentUser ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoute;