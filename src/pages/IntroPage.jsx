import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithPopup } from "../firebase";

export default function IntroPage() {
  const navigate = useNavigate();
  const [consentGiven, setConsentGiven] = useState(false);

  // 🔁 On first mount: reset consent and force fresh session every time
  useEffect(() => {
    localStorage.removeItem("voxamail_consent");
    setConsentGiven(false);

    // Sign out to force clean state
    auth.signOut().then(() => {
      console.log("🔒 Firebase signed out on mount.");
    });
  }, []);

  // ✅ Consent checkbox toggle
  const handleConsentChange = (e) => {
    const checked = e.target.checked;
    console.log("📝 Consent checkbox changed:", checked);
    setConsentGiven(checked);
    if (checked) {
      localStorage.setItem("voxamail_consent", "true");
    } else {
      localStorage.removeItem("voxamail_consent");
    }
  };

  // ✅ Main login logic with Gmail scopes
  const handleStart = async () => {
    if (!consentGiven) {
      toast.error("Please accept Terms and Privacy to continue.");
      return;
    }

    try {
      console.log("🚀 Starting login...");

      // 🧼 Clear local storage just in case
      localStorage.removeItem("access_token");
      localStorage.removeItem("email");

      // 🛡️ Setup Google provider with proper scopes
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
      provider.addScope("https://www.googleapis.com/auth/userinfo.email");
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
      provider.setCustomParameters({ prompt: "consent" });

      // 🚪 Sign in with popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("✅ Popup login success:", user.email);

      // 🎯 Get Google access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || "";
      const idToken = await user.getIdToken();

      if (!accessToken) {
        throw new Error("❌ Missing Gmail OAuth access token.");
      }

      // 🧠 Send to backend
      const response = await fetch("http://localhost:8000/auth/store-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          access_token: accessToken,
          refresh_token: "", // Not available in Firebase popup flow
        }),
      });

      const data = await response.json();
      console.log("🧪 Tokens stored in backend:", data);

      if (data.status !== "success") {
        throw new Error("❌ Backend rejected token storage.");
      }

      // 💾 Store in frontend
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("email", user.email); // <-- use "email" everywhere
      localStorage.setItem("voxamail_consent", "true"); // <-- ensure consent is set

      // ✅ Navigate to home
      navigate("/home");
    } catch (err) {
      console.error("❌ Login or token fetch failed:", err);
      toast.error("Login failed. Please allow popups and try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 text-center">
      <h1 className="text-5xl font-bold mb-6 animate-pulse text-blue-600">VoxaMail</h1>
      <p className="mb-3 text-gray-600">
        Your AI-native Gmail assistant with voice, automation, and insights.
      </p>

      <div className="flex items-center gap-2 my-4 text-sm">
        <input
          type="checkbox"
          id="consent"
          checked={consentGiven}
          onChange={handleConsentChange}
          className="w-4 h-4"
        />
        <label htmlFor="consent">
          I agree to the{" "}
          <a href="/terms" className="text-blue-600 underline" target="_blank" rel="noreferrer">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 underline" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        onClick={handleStart}
        disabled={!consentGiven}
        className={`px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transition-all ${
          consentGiven
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}
