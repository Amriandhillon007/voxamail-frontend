// frontend/src/pages/OnboardCheck.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    const consentGiven = localStorage.getItem("voxamail_consent");

    // Optional debug log
    // console.log("📧 User Email:", userEmail);
    // console.log("✅ Consent Given:", consentGiven);

    if (!userEmail) {
      navigate("/"); // Redirect to login/intro
    } else if (consentGiven !== "true") {
      navigate("/terms"); // Show Terms of Use
    } else {
      navigate("/home"); // Proceed to inbox
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Verifying your account. Please wait...
    </div>
  );
}
