// Spinner.jsx
import React from "react";
import "./Spinner.css"; // Make sure this file exists

const Spinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="vm-loader mb-3"></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default Spinner;
  