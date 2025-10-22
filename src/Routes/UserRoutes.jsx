import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";

export default function UserRoutes() {
  const { user } = useContext(AuthContext);

  if (user && user?.role == "User") {
    return <Outlet />;
  } else if (user && user?.role == "Admin") {
    return <Navigate to="/admin" replace />;
  }else{
  return <Navigate to="/login" replace/>
  }
}
