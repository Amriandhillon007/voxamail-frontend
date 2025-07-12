// 🚀 Login.jsx — Firebase + Gmail OAuth Login Flow (Stable & Clean)
import React, { useEffect } from "react";
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

      if (!user || !user.email) {
        alert("❌ Firebase login failed. No email found.");
        return;
      }

      const email = user.email.trim().toLowerCase();
      console.log("✅ Firebase login success:", email);
      localStorage.setItem("email", email);

      // 🔐 Step 2: Request Gmail OAuth redirect URL
      const res = await fetch("http://localhost:8000/auth/login");
      const data = await res.json();

      if (data.auth_url) {
        console.log("🔗 Redirecting to Gmail OAuth...");
        window.location.href = data.auth_url;
      } else {
        alert("❌ Failed to receive Gmail auth URL from backend.");
      }
    } catch (err) {
      console.error("❌ Firebase login error:", err);
      alert("Google sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    // 🧹 Only clear if NOT on callback path (prevents wiping tokens post-Gmail redirect)
    if (!window.location.pathname.includes("/auth/callback")) {
      console.log("🧹 Clearing old session...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("email");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200 px-6">
      <h1 className="text-4xl font-bold text-indigo-800 mb-6">Welcome to VoxaMail</h1>

      <p className="text-md text-gray-700 text-center max-w-md mb-8">
        Connect your Gmail to unlock AI inbox commands, voice actions, and email automation.
      </p>

      <button
        onClick={handleLogin}
        className="bg-white text-black px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition-all"
      >
        🔐 Sign in with Google
      </button>

      <p className="mt-5 text-xs text-gray-500">
        By continuing, you agree to our{" "}
        <a href="/about" className="underline hover:text-indigo-700">
          Terms & Privacy Policy
        </a>.
      </p>
    </div>
  );
};

export default Login;
