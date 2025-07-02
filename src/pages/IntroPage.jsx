import React from 'react';
import { signInWithPopup, auth, provider } from "../firebase";
import { useNavigate } from 'react-router-dom';

export default function IntroPage() {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ Optional: Log user info
      console.log("🔐 Logged in user:", user);

      // ✅ Save email or ID to localStorage if needed
      localStorage.setItem("user_email", user.email);

      // ✅ Redirect to homepage
      navigate("/home");
    } catch (error) {
      console.error("❌ Firebase login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-5xl font-bold mb-6 animate-pulse text-blue-600">VoxaMail</h1>

      <div className="mb-10 text-gray-700 text-center max-w-md">
        <p>Your AI-native voice assistant for Gmail.</p>
        <p>Manage, automate, and listen to your inbox like never before.</p>
      </div>

      <button
        onClick={handleStart}
        className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
      >
        Get Started
      </button>

      <div className="mt-10 flex gap-6 text-sm text-gray-500 underline">
        <a href="/home">Home</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  );
}
