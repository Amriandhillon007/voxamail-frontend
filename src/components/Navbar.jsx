// ✅ Navbar.jsx - Top navigation bar
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const linkStyle = (path) =>
    location.pathname === path
      ? "text-indigo-600 font-semibold"
      : "text-gray-600 hover:text-indigo-500";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-indigo-700">
        VoxaMail
      </Link>
      <div className="space-x-6 text-sm">
        <Link to="/home" className={linkStyle("/home")}>
          Inbox
        </Link>
        <Link to="/about" className={linkStyle("/about")}>
          About
        </Link>
        <Link
          to="/login"
          className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded shadow"
        >
          Logout
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;