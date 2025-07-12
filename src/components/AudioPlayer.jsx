import React from "react";

const AudioPlayer = ({ src, onClose }) => {
  return (
    <div className="fixed bottom-4 left-4 bg-white shadow-lg rounded-xl p-4 flex items-center gap-4 z-50 border border-gray-300">
      <audio controls autoPlay src={src} className="max-w-[300px]" />
      <button
        onClick={onClose}
        className="text-sm text-red-600 hover:underline"
      >
        Close
      </button>
    </div>
  );
};

export default AudioPlayer;
