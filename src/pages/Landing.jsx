// 🚀 Landing.jsx - Intro Page for VoxaMail
import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white text-gray-800">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2">Welcome to VoxaMail</h1>
        <p className="text-lg text-gray-600">Your AI-powered inbox assistant for Gmail.</p>
      </header>

      <main className="flex flex-col items-center justify-center px-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png"
          alt="AI Email Assistant"
          className="w-40 h-40 mb-6"
        />

        <p className="max-w-xl text-center mb-6">
          VoxaMail helps you read, manage, delete, and reply to emails with simple commands. Connect your Gmail and let our AI do the hard work.
        </p>

        <Link
          to="/home"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transition"
        >
          Launch Inbox
        </Link>

        <Link
          to="/about"
          className="mt-4 text-sm text-gray-500 underline hover:text-indigo-600"
        >
          Terms & Privacy
        </Link>
      </main>

      <footer className="text-center text-xs text-gray-400 mt-12 py-4">
        &copy; {new Date().getFullYear()} VoxaMail. Built with ❤️ by Amritpal.
      </footer>
    </div>
  );
};

export default Landing;
