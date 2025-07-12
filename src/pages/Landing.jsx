// 🚀 Landing.jsx — VoxaMail Intro Page (Upgraded UI + Consent Ready)
import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white text-gray-800">
      <header className="text-center py-14">
        <h1 className="text-5xl font-bold text-indigo-700 mb-3">Welcome to VoxaMail</h1>
        <p className="text-lg text-gray-600">Your AI-powered Gmail inbox assistant.</p>
      </header>

      <main className="flex flex-col items-center justify-center px-6 flex-grow">
        <img
          src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png"
          alt="AI Email Assistant"
          className="w-36 h-36 mb-6 drop-shadow"
          loading="lazy"
        />

        <p className="max-w-xl text-center mb-6 text-gray-700 leading-relaxed">
          VoxaMail helps you read, manage, summarize, delete, and reply to emails
          using AI-powered tools — all inside Gmail.
        </p>

        <Link
          to="/home"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-6 py-3 rounded-lg shadow-lg transition duration-200"
        >
          🚀 Launch Inbox
        </Link>

        <Link
          to="/about"
          className="mt-5 text-sm text-gray-500 underline hover:text-indigo-600"
        >
          Terms & Privacy Policy
        </Link>
      </main>

      <footer className="text-center text-xs text-gray-400 mt-12 mb-4">
        &copy; {new Date().getFullYear()} VoxaMail — Built with ❤️ by Amritpal Dhillon
      </footer>
    </div>
  );
};

export default Landing;
