import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const email = urlParams.get("email");

    console.log("🔐 Received from Google:", {
      accessToken,
      refreshToken,
      email,
    });

    // Validate all fields
    if (
      !accessToken ||
      !refreshToken ||
      !email ||
      accessToken === "null" ||
      refreshToken === "null" ||
      email === "null"
    ) {
      console.error("❌ Invalid or missing tokens.");
      alert("Login failed. Please try again.");
      navigate("/");
      return;
    }

    try {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("email", email);
    } catch (err) {
      console.error("❌ Failed to store tokens in localStorage:", err);
      alert("Your browser blocked local storage. Please enable it.");
      navigate("/");
      return;
    }

    // Send tokens to backend
    fetch("http://localhost:8000/auth/store-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Token stored in backend:", data);

        if (data.status === "success") {
          // Clean URL + navigate
          window.history.replaceState({}, document.title, "/auth/callback");
          setTimeout(() => navigate("/home"), 200); // Delay for smoother transition
        } else {
          console.error("❌ Token storage failed:", data);
          alert("Could not store tokens. Try again.");
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("❌ Network error while syncing with backend:", err);
        alert("Server error. Please retry login.");
        navigate("/");
      });
  }, [navigate, location]);

  return (
    <div className="flex justify-center items-center h-screen text-gray-600 text-xl">
      🔐 Logging you in...
    </div>
  );
};

export default AuthCallback;
