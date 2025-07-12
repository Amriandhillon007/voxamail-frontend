// frontend/src/components/SummaryCard.jsx

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { speakText, stopReading, isCurrentlySpeaking } from "../utils/tts";

const SummaryCard = ({ summary, onClear }) => {
  const [visible, setVisible] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (summary && summary.length > 5) {
      setVisible(true);
    }
  }, [summary]);

  const handleClear = () => {
    setVisible(false);
    stopReading();
    setTimeout(onClear, 200);
  };

  const handleSpeak = async () => {
    if (isCurrentlySpeaking()) {
      stopReading();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    await speakText(summary, "coqui-default", () => setSpeaking(false));
  };

  if (!summary || !visible) return null;

  const isEmpty =
    summary.trim().toLowerCase().includes("no summary returned") ||
    summary.trim().toLowerCase().includes("no matching") ||
    summary.trim().length < 10;

  return (
    <AnimatePresence>
      <motion.div
        className={`relative mb-6 p-5 border rounded-2xl shadow-md backdrop-blur-md transition-all duration-300 ${
          isEmpty ? "bg-red-50/80 border-red-200" : "bg-white/80 border-indigo-100"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 text-sm text-gray-400 hover:text-gray-600"
          title="Clear summary"
        >
          ✖
        </button>

        <h3 className={`text-lg font-bold mb-2 ${isEmpty ? "text-red-600" : "text-indigo-700"}`}>
          🧠 AI Summary
        </h3>

        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {isEmpty
            ? "⚠️ No meaningful summary could be generated for your current filters."
            : summary}
        </p>

        {!isEmpty && (
          <button
            onClick={handleSpeak}
            className={`mt-3 text-sm ${
              speaking ? "text-red-600" : "text-indigo-600"
            } hover:underline`}
          >
            {speaking ? "🛑 Stop Reading" : "🔊 Read Summary"}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryCard;
