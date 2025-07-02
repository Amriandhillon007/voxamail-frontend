import React from "react";

const SummaryModal = ({ summary, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">🧠 Voxa Summary</h2>

        <p className="text-sm text-gray-500 mb-2">
          Here's a concise summary based on your current filters.
        </p>

        <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-gray-800 bg-gray-100 p-4 rounded-md border">
          {summary}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(summary);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            📋 Copy
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
