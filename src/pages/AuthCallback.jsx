import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get("access_token") || "";
    const refreshToken = urlParams.get("refresh_token") || "";
    const email = urlParams.get("email") || "";

    console.log("✅ Extracted from URL:", { accessToken, refreshToken, email });

    // Validate tokens
    if (!accessToken || !email || accessToken === "null" || email === "null") {
      alert("❌ Missing tokens. Please log in again.");
      navigate("/");
      return;
    }

    // ✅ Save to localStorage
    try {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("email", email);
    } catch (e) {
      console.error("❌ Failed to store tokens:", e);
      alert("Local storage failed. Clear cookies and try again.");
      return;
    }

    // ✅ Sync with backend
    fetch("http://localhost:8000/auth/store-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, access_token: accessToken, refresh_token: refreshToken })
    })
      .then(res => res.json())
      .then(data => {
        console.log("🗂️ Token storage response:", data);

        if (data.status === "success") {
          // ✅ Clear query string and redirect cleanly
          window.history.replaceState({}, document.title, "/auth/callback");
          // ⏳ Delay to ensure localStorage commits
          setTimeout(() => navigate("/home"), 200);
        } else {
          alert("❌ Backend token store failed.");
          navigate("/");
        }
      })
      .catch(err => {
        console.error("❌ Backend network error:", err);
        alert("Could not store tokens. Try again.");
        navigate("/");
      });
  }, [navigate, location]);

  return (
    <div className="text-center mt-20 text-xl text-gray-600">
      Logging you in...
    </div>
  );
};

export default AuthCallback;
