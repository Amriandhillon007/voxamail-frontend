import React, { useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        console.log("✅ Firebase user email:", user.email);
        localStorage.setItem("email", user.email);

        // Step 2: Request Gmail OAuth URL from backend
        const response = await fetch("http://localhost:8000/auth/login");
        const data = await response.json();

        if (data.auth_url) {
          console.log("🔗 Redirecting to Gmail OAuth...");
          window.location.href = data.auth_url;
        } else {
          alert("❌ Failed to receive Gmail auth URL.");
        }
      } else {
        alert("❌ Firebase login failed. No user email.");
      }
    } catch (error) {
      console.error("Firebase Login error:", error);
      alert("Firebase login failed. Please try again.");
    }
  };

  // ✅ Optional cleanup ONLY if user is starting fresh — not after Gmail redirect
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isAuthCallback = currentPath.includes("/auth/callback");

    if (!isAuthCallback) {
      console.log("🧹 Clearing old session...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("email");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-200 to-purple-300">
      <h1 className="text-4xl font-bold mb-8">Welcome to VoxaMail</h1>
      <p className="text-lg mb-6 text-gray-700 text-center max-w-md">
        Connect your Gmail account to unlock voice-controlled inbox,
        bulk email tools, and AI chat commands.
      </p>
      <button
        onClick={handleLogin}
        className="bg-white text-black px-6 py-3 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
