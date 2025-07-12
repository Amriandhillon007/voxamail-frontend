import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const linkStyle = (path) =>
    location.pathname === path
      ? "text-indigo-700 font-semibold"
      : "text-gray-600 hover:text-indigo-700";

  const handleLogout = () => {
    localStorage.clear(); // or specific key: localStorage.removeItem("user_email");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-extrabold text-indigo-700 tracking-tight">
        VoxaMail
      </Link>

      <div className="space-x-6 text-sm">
        <Link to="/home" className={linkStyle("/home")}>
          Inbox
        </Link>
        <Link to="/about" className={linkStyle("/about")}>
          About
        </Link>
        <button
          onClick={handleLogout}
          className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded shadow"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
