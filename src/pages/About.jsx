// 📄 About.jsx - Terms & Privacy (Required for Google OAuth)
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      <div className="p-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-indigo-700">About VoxaMail</h1>
          <p className="text-sm text-gray-500">Privacy Policy & Terms of Use</p>
        </header>

        <section className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold">🔐 Privacy Policy</h2>
          <p>
            VoxaMail temporarily accesses your Gmail inbox using Google OAuth tokens. We do not store, share, or sell your data. All actions are performed securely on your behalf and tokens can be revoked anytime via your Google account.
          </p>

          <h2 className="text-xl font-semibold">📄 Terms of Use</h2>
          <p>
            This tool is provided as-is for productivity purposes. You agree to use it responsibly. By connecting your Gmail account, you authorize VoxaMail to read, send, and manage emails only upon your command.
          </p>

          <h2 className="text-xl font-semibold">📬 Contact</h2>
          <p>
            For support or feedback, contact the developer at <strong>voxa.team@gmail.com</strong> (placeholder).
          </p>

          <div className="mt-6">
            <Link to="/" className="text-indigo-600 underline">
              ← Back to Home
            </Link>
          </div>
        </section>
      </div>

      <footer className="text-center text-xs text-gray-400 mt-12">
        &copy; {new Date().getFullYear()} VoxaMail. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
