// src/components/SummaryModal.jsx – ✅ Final Production Voxa AI Summary Modal
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { speakText, stopReading, isCurrentlySpeaking } from "../utils/tts";

const SummaryModal = ({ summary = "", onClose }) => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup if modal unmounts
    return () => {
      stopReading();
    };
  }, []);

  const handleSpeak = async () => {
    if (isCurrentlySpeaking()) {
      stopReading();
      setSpeaking(false);
      return;
    }

    if (!summary || summary.trim().length < 5) {
      toast.error("❌ Nothing to speak.");
      return;
    }

    setSpeaking(true);
    await speakText(summary, "coqui-default", () => setSpeaking(false));
  };

  const handleClose = () => {
    stopReading();
    setSpeaking(false);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success("📋 Summary copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 sm:px-0">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 animate-fadeIn relative">
        <h2 className="text-xl font-bold mb-1 text-indigo-700 flex items-center">
          🧠 Voxa AI Summary
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          AI-generated summary based on your current filters.
        </p>

        <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-md border border-gray-200 text-sm leading-relaxed space-y-2">
          {summary.trim().split("\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 hover:underline hover:font-medium"
            >
              📋 Copy
            </button>
            <button
              onClick={handleSpeak}
              className={`text-sm font-medium hover:underline ${
                speaking ? "text-red-600" : "text-purple-600"
              }`}
            >
              {speaking ? "🛑 Stop Reading" : "🔊 Speak Summary"}
            </button>
          </div>

          <button
            onClick={handleClose}
            className="ml-auto bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm text-sm"
          >
            Close
          </button>
        </div>

        {speaking && (
          <div className="mt-3 text-indigo-600 font-medium text-sm animate-pulse">
            🔈 Speaking... (AI Voice)
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryModal;
