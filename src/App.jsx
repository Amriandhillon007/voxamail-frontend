// 📲 App.jsx – Cleaned & Fixed Full Routing

import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import IntroPage from "./pages/IntroPage";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import SendEmail from "./pages/SendEmail";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

function App() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/intro" />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/send" element={<SendEmail />} />

        {/* ✅ Protect /home: only allow if consent given */}
        <Route
  path="/home"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>






        {/* ✅ Catch-all route */}
        <Route
          path="*"
          element={
            <div className="p-10 text-center text-red-500 text-xl">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
