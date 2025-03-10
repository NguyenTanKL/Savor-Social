import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Kiểm tra token
  return token ? children : <Navigate to="/LoginPage" />;
};

export default ProtectedRoute;
