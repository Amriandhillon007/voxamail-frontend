// 📦 ProtectedRoute.jsx — Phase 6.5+ Hardened Access Guard
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState(null); // null = loading

  useEffect(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("access_token");
    const consent = localStorage.getItem("voxamail_consent");

    // ✅ Validate all required tokens
    if (
      consent === "true" &&
      email &&
      email !== "null" &&
      token &&
      token !== "null"
    ) {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
    }
  }, []);

  if (isAllowed === null) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 text-center text-gray-600">
        <Spinner message="Verifying session..." />
      </div>
    );
  }

  return isAllowed ? children : <Navigate to="/intro" replace />;
};

export default ProtectedRoute;
